
-- 1. Families table
CREATE TABLE public.families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.families TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.families TO authenticated;
GRANT ALL ON public.families TO service_role;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view families" ON public.families FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage families" ON public.families FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER families_set_updated_at BEFORE UPDATE ON public.families FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.families (name, sort_order) VALUES
  ('Amaderados', 1), ('Florales', 2), ('Cítricos', 3), ('Orientales', 4);

-- Block deleting a family with products
CREATE OR REPLACE FUNCTION public.tg_block_family_delete()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.products WHERE family = OLD.name) THEN
    RAISE EXCEPTION 'No se puede borrar la familia "%" porque tiene productos asignados.', OLD.name;
  END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER families_block_delete BEFORE DELETE ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.tg_block_family_delete();

-- 2. Public order placement RPC (cart -> order)
CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_address text,
  p_notes text,
  p_items jsonb  -- [{product_id, quantity}]
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_total numeric(12,2) := 0;
  v_item jsonb;
  v_prod record;
  v_qty int;
BEGIN
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) = 0 THEN
    RAISE EXCEPTION 'Nombre requerido';
  END IF;
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'El pedido no tiene productos';
  END IF;

  INSERT INTO public.orders (customer_name, customer_phone, customer_email, address, notes, total, status)
  VALUES (p_customer_name, p_customer_phone, p_customer_email, p_address, p_notes, 0, 'Pendiente'::order_status)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := GREATEST(1, (v_item->>'quantity')::int);
    SELECT id, name, price INTO v_prod FROM public.products WHERE id = (v_item->>'product_id')::uuid AND active = true;
    IF v_prod.id IS NULL THEN CONTINUE; END IF;
    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price)
    VALUES (v_order_id, v_prod.id, v_prod.name, v_qty, v_prod.price);
    v_total := v_total + (v_prod.price * v_qty);
  END LOOP;

  UPDATE public.orders SET total = v_total WHERE id = v_order_id;
  RETURN v_order_id;
END;
$$;
REVOKE ALL ON FUNCTION public.place_order(text,text,text,text,text,jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.place_order(text,text,text,text,text,jsonb) TO anon, authenticated;

-- 3. Confirm order -> decrement stock (idempotent via stock_applied flag in notes-less way: add column)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stock_applied boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.confirm_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_item record;
BEGIN
  IF NOT app_private.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF (SELECT stock_applied FROM public.orders WHERE id = p_order_id) THEN
    RETURN;
  END IF;
  FOR v_item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id AND product_id IS NOT NULL LOOP
    UPDATE public.products SET stock = GREATEST(0, stock - v_item.quantity) WHERE id = v_item.product_id;
  END LOOP;
  UPDATE public.orders SET stock_applied = true WHERE id = p_order_id;
END;
$$;
REVOKE ALL ON FUNCTION public.confirm_order(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.confirm_order(uuid) TO authenticated;

-- 4. Seed new site_content keys
INSERT INTO public.site_content (key, value) VALUES
  ('shipping_returns', jsonb_build_object(
    'title', 'Envíos y Devoluciones',
    'intro', 'Enviamos a todo el país a través de Correo Argentino y cadetería en CABA y GBA.',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Tiempos de entrega', 'body', 'CABA y GBA: 24 a 72hs hábiles. Interior: 3 a 7 días hábiles.'),
      jsonb_build_object('title', 'Cambios', 'body', 'Aceptamos cambios dentro de los 7 días siguientes a la recepción, siempre que el producto esté sin uso y en su empaque original.'),
      jsonb_build_object('title', 'Devoluciones', 'body', 'Por tratarse de productos cosméticos no se aceptan devoluciones, salvo defecto de fábrica.')
    )
  )),
  ('faqs', jsonb_build_object(
    'title', 'Preguntas Frecuentes',
    'items', jsonb_build_array(
      jsonb_build_object('q', '¿Cuánto duran los perfumes?', 'a', 'Nuestras fragancias tienen una duración promedio de 6 a 10 horas, según tipo de piel y condiciones ambientales.'),
      jsonb_build_object('q', '¿Cómo conservo el perfume?', 'a', 'Guardalo en un lugar fresco, lejos de la luz directa y de la humedad. Evitá temperaturas extremas.'),
      jsonb_build_object('q', '¿Puedo elegir el envoltorio para regalo?', 'a', 'Sí, indicalo en las notas del pedido y lo preparamos con packaging especial sin cargo.')
    )
  ))
ON CONFLICT (key) DO NOTHING;

-- 5. WhatsApp number into contact (no-op if exists)
UPDATE public.site_content
SET value = value || jsonb_build_object(
  'whatsapp', COALESCE(value->>'whatsapp', '5491112345678'),
  'whatsapp_message', COALESCE(value->>'whatsapp_message', 'Hola, me gustaría una asesoría de aromas')
)
WHERE key = 'contact';
