-- =============================================
-- MOBILE MONEY WALLETS SYSTEM
-- =============================================

-- Table: mobile_wallets (MTN MoMo + Orange Money)
CREATE TABLE public.mobile_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator TEXT NOT NULL CHECK (operator IN ('mtn_momo', 'orange_money')),
  balance NUMERIC NOT NULL DEFAULT 0,
  pending_balance NUMERIC NOT NULL DEFAULT 0,
  total_received NUMERIC NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC NOT NULL DEFAULT 0,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(operator)
);

-- Table: wallet_transactions
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.mobile_wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund')),
  amount NUMERIC NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 0,
  reference TEXT,
  phone_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description TEXT,
  related_id UUID,
  related_type TEXT CHECK (related_type IN ('subscription', 'order', 'commission')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- =============================================
-- WANDA SERVICES (Logistics/Shipments)
-- =============================================

-- Table: shipments
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT NOT NULL UNIQUE,
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'local' CHECK (type IN ('local', 'international')),
  status TEXT NOT NULL DEFAULT 'picked_up' CHECK (status IN ('picked_up', 'in_transit', 'delivered', 'damaged')),
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  weight_kg NUMERIC,
  delivery_cost NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  is_damaged BOOLEAN NOT NULL DEFAULT false,
  is_returned BOOLEAN NOT NULL DEFAULT false,
  damage_notes TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  picked_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE public.mobile_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- mobile_wallets: Super admins only
CREATE POLICY "Super admins can manage wallets"
ON public.mobile_wallets FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- wallet_transactions: Super admins full access
CREATE POLICY "Super admins can manage wallet transactions"
ON public.wallet_transactions FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- wallet_transactions: Shop owners can view their transactions
CREATE POLICY "Shop owners can view their transactions"
ON public.wallet_transactions FOR SELECT
USING (
  related_id IN (
    SELECT id FROM public.shops WHERE user_id = auth.uid()
  )
);

-- shipments: Super admins full access
CREATE POLICY "Super admins can manage shipments"
ON public.shipments FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- shipments: Shop owners can view their shipments
CREATE POLICY "Shop owners can view their shipments"
ON public.shipments FOR SELECT
USING (
  shop_id IN (
    SELECT id FROM public.shops WHERE user_id = auth.uid()
  )
);

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE TRIGGER update_mobile_wallets_updated_at
BEFORE UPDATE ON public.mobile_wallets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallet_transactions_updated_at
BEFORE UPDATE ON public.wallet_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
BEFORE UPDATE ON public.shipments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- MOCK DATA: Wallets
-- =============================================

INSERT INTO public.mobile_wallets (operator, balance, pending_balance, total_received, total_withdrawn, last_sync_at)
VALUES 
  ('mtn_momo', 2450000, 125000, 8500000, 6050000, now()),
  ('orange_money', 1875000, 89000, 6200000, 4325000, now());

-- =============================================
-- MOCK DATA: Wallet Transactions (last 30 days)
-- =============================================

-- Get wallet IDs for transactions
WITH wallet_ids AS (
  SELECT id, operator FROM public.mobile_wallets
)
INSERT INTO public.wallet_transactions (wallet_id, type, amount, fee, reference, phone_number, status, description, related_type, created_at, completed_at)
SELECT 
  w.id,
  t.type,
  t.amount,
  t.fee,
  t.reference,
  t.phone_number,
  t.status,
  t.description,
  t.related_type,
  t.created_at,
  CASE WHEN t.status = 'completed' THEN t.created_at + interval '5 minutes' ELSE NULL END
FROM wallet_ids w
CROSS JOIN (
  VALUES
    -- MTN MoMo transactions
    ('mtn_momo', 'deposit', 150000, 1500, 'MTN-2024-001', '237650001234', 'completed', 'Abonnement boutique Rhumsiki', 'subscription', now() - interval '2 days'),
    ('mtn_momo', 'deposit', 75000, 750, 'MTN-2024-002', '237650005678', 'completed', 'Commission partenaire', 'commission', now() - interval '5 days'),
    ('mtn_momo', 'withdrawal', 200000, 2000, 'MTN-2024-003', '237650009999', 'completed', 'Retrait vers compte bancaire', NULL, now() - interval '7 days'),
    ('mtn_momo', 'deposit', 50000, 500, 'MTN-2024-004', '237650002222', 'completed', 'Paiement commande #1234', 'order', now() - interval '10 days'),
    ('mtn_momo', 'deposit', 125000, 1250, 'MTN-2024-005', '237650003333', 'pending', 'Abonnement Premium en attente', 'subscription', now() - interval '1 day'),
    ('mtn_momo', 'refund', 25000, 0, 'MTN-2024-006', '237650004444', 'completed', 'Remboursement commande annulée', 'order', now() - interval '15 days'),
    ('mtn_momo', 'deposit', 180000, 1800, 'MTN-2024-007', '237650005555', 'completed', 'Abonnement VIP', 'subscription', now() - interval '20 days'),
    ('mtn_momo', 'deposit', 95000, 950, 'MTN-2024-008', '237650006666', 'completed', 'Commission Q4', 'commission', now() - interval '25 days'),
    ('mtn_momo', 'withdrawal', 100000, 1000, 'MTN-2024-009', '237650007777', 'failed', 'Retrait échoué - solde insuffisant', NULL, now() - interval '3 days'),
    ('mtn_momo', 'deposit', 200000, 2000, 'MTN-2024-010', '237650008888', 'completed', 'Paiement groupé', 'order', now() - interval '12 days'),
    -- Orange Money transactions
    ('orange_money', 'deposit', 120000, 1200, 'OM-2024-001', '237690001111', 'completed', 'Abonnement boutique Maroua', 'subscription', now() - interval '3 days'),
    ('orange_money', 'deposit', 65000, 650, 'OM-2024-002', '237690002222', 'completed', 'Commission partenaire Nord', 'commission', now() - interval '6 days'),
    ('orange_money', 'withdrawal', 150000, 1500, 'OM-2024-003', '237690003333', 'completed', 'Retrait mensuel', NULL, now() - interval '8 days'),
    ('orange_money', 'deposit', 45000, 450, 'OM-2024-004', '237690004444', 'completed', 'Commande en ligne', 'order', now() - interval '11 days'),
    ('orange_money', 'deposit', 89000, 890, 'OM-2024-005', '237690005555', 'pending', 'Validation en cours', 'subscription', now() - interval '1 day'),
    ('orange_money', 'refund', 15000, 0, 'OM-2024-006', '237690006666', 'completed', 'Remboursement partiel', 'order', now() - interval '18 days'),
    ('orange_money', 'deposit', 160000, 1600, 'OM-2024-007', '237690007777', 'completed', 'Pack Business', 'subscription', now() - interval '22 days'),
    ('orange_money', 'deposit', 80000, 800, 'OM-2024-008', '237690008888', 'completed', 'Commission Extrême-Nord', 'commission', now() - interval '27 days'),
    ('orange_money', 'withdrawal', 75000, 750, 'OM-2024-009', '237690009999', 'completed', 'Retrait ATM', NULL, now() - interval '4 days'),
    ('orange_money', 'deposit', 135000, 1350, 'OM-2024-010', '237690001234', 'completed', 'Renouvellement annuel', 'subscription', now() - interval '14 days')
) AS t(operator, type, amount, fee, reference, phone_number, status, description, related_type, created_at)
WHERE w.operator = t.operator;

-- =============================================
-- MOCK DATA: Shipments (last 30 days)
-- =============================================

INSERT INTO public.shipments (tracking_number, type, status, origin_city, destination_city, weight_kg, delivery_cost, delivery_fee, is_damaged, is_returned, damage_notes, customer_rating, picked_at, delivered_at, created_at)
VALUES
  ('WANDA-2024-0001', 'local', 'delivered', 'Maroua', 'Garoua', 2.5, 3500, 700, false, false, NULL, 5, now() - interval '5 days', now() - interval '3 days', now() - interval '6 days'),
  ('WANDA-2024-0002', 'local', 'delivered', 'Douala', 'Yaoundé', 5.0, 5000, 1000, false, false, NULL, 4, now() - interval '7 days', now() - interval '5 days', now() - interval '8 days'),
  ('WANDA-2024-0003', 'international', 'in_transit', 'Yaoundé', 'Lagos', 3.2, 15000, 3000, false, false, NULL, NULL, now() - interval '2 days', NULL, now() - interval '3 days'),
  ('WANDA-2024-0004', 'local', 'damaged', 'Bafoussam', 'Douala', 1.8, 4000, 800, true, true, 'Colis écrasé pendant transport', 1, now() - interval '10 days', now() - interval '8 days', now() - interval '11 days'),
  ('WANDA-2024-0005', 'local', 'delivered', 'Ngaoundéré', 'Maroua', 4.0, 4500, 900, false, false, NULL, 5, now() - interval '12 days', now() - interval '10 days', now() - interval '13 days'),
  ('WANDA-2024-0006', 'local', 'picked_up', 'Kribi', 'Douala', 2.0, 3000, 600, false, false, NULL, NULL, now() - interval '1 day', NULL, now() - interval '1 day'),
  ('WANDA-2024-0007', 'international', 'delivered', 'Douala', 'Paris', 8.5, 45000, 9000, false, false, NULL, 5, now() - interval '20 days', now() - interval '14 days', now() - interval '21 days'),
  ('WANDA-2024-0008', 'local', 'in_transit', 'Bamenda', 'Bafoussam', 3.5, 3500, 700, false, false, NULL, NULL, now() - interval '2 days', NULL, now() - interval '3 days'),
  ('WANDA-2024-0009', 'local', 'delivered', 'Limbé', 'Buea', 1.2, 2000, 400, false, false, NULL, 4, now() - interval '15 days', now() - interval '14 days', now() - interval '15 days'),
  ('WANDA-2024-0010', 'local', 'damaged', 'Ebolowa', 'Yaoundé', 6.0, 5500, 1100, true, false, 'Emballage déchiré, contenu intact', 3, now() - interval '8 days', now() - interval '6 days', now() - interval '9 days'),
  ('WANDA-2024-0011', 'international', 'in_transit', 'Yaoundé', 'Bruxelles', 4.5, 35000, 7000, false, false, NULL, NULL, now() - interval '4 days', NULL, now() - interval '5 days'),
  ('WANDA-2024-0012', 'local', 'delivered', 'Garoua', 'Ngaoundéré', 2.8, 3800, 760, false, false, NULL, 5, now() - interval '18 days', now() - interval '16 days', now() - interval '19 days'),
  ('WANDA-2024-0013', 'local', 'picked_up', 'Douala', 'Limbé', 1.5, 2500, 500, false, false, NULL, NULL, now() - interval '6 hours', NULL, now() - interval '6 hours'),
  ('WANDA-2024-0014', 'local', 'delivered', 'Yaoundé', 'Kribi', 3.0, 4000, 800, false, false, NULL, 4, now() - interval '22 days', now() - interval '20 days', now() - interval '23 days'),
  ('WANDA-2024-0015', 'international', 'delivered', 'Maroua', 'Dubaï', 2.0, 28000, 5600, false, false, NULL, 5, now() - interval '25 days', now() - interval '20 days', now() - interval '26 days');