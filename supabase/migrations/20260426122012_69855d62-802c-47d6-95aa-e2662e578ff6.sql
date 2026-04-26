-- Sous-commandes par boutique
CREATE TABLE IF NOT EXISTS public.shop_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  shop_name text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  statut text NOT NULL DEFAULT 'en_attente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Virements/dispatch vers les boutiques
CREATE TABLE IF NOT EXISTS public.shop_payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_order_id uuid REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  montant numeric NOT NULL DEFAULT 0,
  mode_paiement text,
  statut text NOT NULL DEFAULT 'en_attente',
  reference_transaction text,
  notes text,
  dispatched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_payouts ENABLE ROW LEVEL SECURITY;

-- Policies shop_orders
CREATE POLICY "Shop owner sees own orders" ON public.shop_orders
  FOR SELECT
  USING (shop_id IN (SELECT id FROM public.shops WHERE user_id = auth.uid()));

CREATE POLICY "Admin full access shop_orders" ON public.shop_orders
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Policies shop_payouts
CREATE POLICY "Shop owner sees own payouts" ON public.shop_payouts
  FOR SELECT
  USING (shop_id IN (SELECT id FROM public.shops WHERE user_id = auth.uid()));

CREATE POLICY "Admin full access shop_payouts" ON public.shop_payouts
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger updated_at sur shop_orders
CREATE TRIGGER update_shop_orders_updated_at
  BEFORE UPDATE ON public.shop_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_shop_orders_order_id ON public.shop_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_shop_id ON public.shop_orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_payouts_shop_order_id ON public.shop_payouts(shop_order_id);
CREATE INDEX IF NOT EXISTS idx_shop_payouts_shop_id ON public.shop_payouts(shop_id);

-- Colonnes paiement sur orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reference_paiement text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS mode_paiement_numero text;