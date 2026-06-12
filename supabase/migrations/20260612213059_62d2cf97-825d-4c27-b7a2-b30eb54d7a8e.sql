CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

GRANT USAGE ON SCHEMA app_private TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO service_role;

ALTER POLICY "Admins manage order items" ON public.order_items
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins manage orders" ON public.orders
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins manage payment methods" ON public.payment_methods
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Anyone can view enabled payment methods" ON public.payment_methods
  USING ((enabled = true) OR app_private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins manage products" ON public.products
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Anyone can view active products" ON public.products
  USING ((active = true) OR app_private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins update profiles" ON public.profiles
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins view all profiles" ON public.profiles
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins manage shipping options" ON public.shipping_options
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Anyone can view enabled shipping" ON public.shipping_options
  USING ((enabled = true) OR app_private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins manage site content" ON public.site_content
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins view all roles" ON public.user_roles
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;