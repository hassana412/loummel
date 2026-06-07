-- Ajoute la colonne 'statut' à la table products pour la modération (actif / suspendu / banni)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS statut text NOT NULL DEFAULT 'actif';

-- S'assure que tous les produits existants sont actifs
UPDATE public.products SET statut = 'actif' WHERE statut IS NULL OR statut = '';

-- Met à jour la policy publique pour ne montrer QUE les produits actifs
DROP POLICY IF EXISTS "Anyone can view products of active shops" ON public.products;
CREATE POLICY "Anyone can view active products of active shops"
ON public.products FOR SELECT TO public
USING (
  shop_id IN (SELECT shops.id FROM shops WHERE shops.status = 'active'::entity_status)
  AND statut = 'actif'
);

-- Trigger updated_at sur products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at'
  ) THEN
    CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;