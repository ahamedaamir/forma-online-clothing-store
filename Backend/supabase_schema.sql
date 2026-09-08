-- =============================================================================
-- FORMA - ONLINE CLOTHING STORE DATABASE SCHEMA
-- Normalized Supabase / PostgreSQL Schema Definition
-- Fully relational, dynamic constraints, UUID keys, triggers, indexes, and views
-- Generated based on Forma ER Diagram & Attribute Specifications
-- =============================================================================

-- Enable required extensions for UUID generation and crypto
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 0. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
    avatar VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 2. ADDRESSES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Sri Lanka',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_addresses_updated_at ON public.addresses;
CREATE TRIGGER trg_addresses_updated_at
    BEFORE UPDATE ON public.addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. CATEGORIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. PRODUCTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    base_price DECIMAL(12, 2) NOT NULL CHECK (base_price >= 0),
    discount_price DECIMAL(12, 2) CHECK (discount_price IS NULL OR discount_price >= 0),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. PRODUCT IMAGES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 6. PRODUCT VARIANTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size VARCHAR(50) NOT NULL,
    color VARCHAR(100) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER trg_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 7. CARTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_carts_updated_at ON public.carts;
CREATE TRIGGER trg_carts_updated_at
    BEFORE UPDATE ON public.carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 8. CART ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_cart_variant UNIQUE (cart_id, variant_id)
);

-- =============================================================================
-- 9. ORDERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    order_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Packed', 'Shipped', 'Delivered', 'Confirmed', 'Cancelled')),
    shipping_address TEXT,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 10. ORDER ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    size VARCHAR(50),
    color VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 11. PAYMENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(100) NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Successful', 'Failed', 'Refunded')),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 12. PRODUCT REVIEWS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_product_reviews_updated_at ON public.product_reviews;
CREATE TRIGGER trg_product_reviews_updated_at
    BEFORE UPDATE ON public.product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 13. COUPONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'PERCENT' CHECK (type IN ('PERCENT', 'FIXED')),
    value DECIMAL(12, 2) NOT NULL CHECK (value > 0),
    min_order_amount DECIMAL(12, 2) DEFAULT 0.00 CHECK (min_order_amount >= 0),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_coupons_updated_at ON public.coupons;
CREATE TRIGGER trg_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 14. ORDER COUPONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.order_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_order_coupon UNIQUE (order_id, coupon_id)
);

-- =============================================================================
-- 15. INVENTORY TRANSACTIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUST')),
    quantity INTEGER NOT NULL,
    reference_id VARCHAR(255),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 16. WISHLISTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_wishlists_updated_at ON public.wishlists;
CREATE TRIGGER trg_wishlists_updated_at
    BEFORE UPDATE ON public.wishlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 17. NOTIFICATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(50) DEFAULT 'in-app',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_notifications_updated_at ON public.notifications;
CREATE TRIGGER trg_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON public.cart_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant_id ON public.inventory_transactions(variant_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Public catalog read access
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Product Images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public Read Product Variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Public Read Product Reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Coupons" ON public.coupons FOR SELECT USING (is_active = true);

-- 2. Open / App Access for API services
CREATE POLICY "App All Access Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Product Images" ON public.product_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Product Variants" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Addresses" ON public.addresses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Carts" ON public.carts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Cart Items" ON public.cart_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Order Items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Reviews" ON public.product_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Order Coupons" ON public.order_coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Inventory" ON public.inventory_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Wishlists" ON public.wishlists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "App All Access Notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- CONVENIENT VIEW: PRODUCTS CATALOG VIEW
-- Aggregates product with category, primary image, images array, variants, and reviews
-- =============================================================================
CREATE OR REPLACE VIEW public.products_catalog_view AS
SELECT
    p.id,
    p.slug,
    p.name,
    c.name AS category,
    c.slug AS category_slug,
    p.description,
    p.base_price AS price,
    p.discount_price,
    'LKR' AS currency,
    CONCAT('LKR ', TO_CHAR(p.base_price, 'FM999,999,990.00')) AS formatted_price,
    CASE 
        WHEN p.is_featured THEN 'Featured'
        ELSE NULL
    END AS tag,
    COALESCE(
        (SELECT pi.image_url FROM public.product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1),
        (SELECT pi.image_url FROM public.product_images pi WHERE pi.product_id = p.id ORDER BY pi.created_at ASC LIMIT 1)
    ) AS image,
    (SELECT pi.image_url FROM public.product_images pi WHERE pi.product_id = p.id AND pi.is_primary = false ORDER BY pi.created_at ASC LIMIT 1) AS hover_image,
    COALESCE(
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', pv.id,
                    'sku', pv.sku,
                    'size', pv.size,
                    'color', pv.color,
                    'price', pv.price,
                    'stock_quantity', pv.stock_quantity
                )
            )
            FROM public.product_variants pv
            WHERE pv.product_id = p.id
        ),
        '[]'::jsonb
    ) AS variants,
    COALESCE(
        (
            SELECT array_agg(DISTINCT pv.size)
            FROM public.product_variants pv
            WHERE pv.product_id = p.id
        ),
        ARRAY['S', 'M', 'L']::VARCHAR[]
    ) AS sizes,
    COALESCE(
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', pi.id,
                    'image_url', pi.image_url,
                    'is_primary', pi.is_primary
                )
            )
            FROM public.product_images pi
            WHERE pi.product_id = p.id
        ),
        '[]'::jsonb
    ) AS images,
    COALESCE((SELECT AVG(pr.rating)::NUMERIC(3,2) FROM public.product_reviews pr WHERE pr.product_id = p.id), 0.00) AS avg_rating,
    COALESCE((SELECT COUNT(pr.id) FROM public.product_reviews pr WHERE pr.product_id = p.id), 0) AS reviews_count,
    p.is_featured,
    p.is_active,
    p.created_at,
    p.updated_at
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id;

-- =============================================================================
-- DYNAMIC SEED SCRIPT (Populates initial data relational-style without hardcoding)
-- =============================================================================

-- 1. Insert Categories
INSERT INTO public.categories (name, slug, description, image, is_active)
VALUES
    ('Men', 'men', 'Men''s contemporary sportswear & streetwear collection', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', true),
    ('Women', 'women', 'Women''s elevated athletic and aesthetic clothing', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', true),
    ('Unisex', 'unisex', 'Universal streetwear silhouettes for everyone', 'https://images.shopify.com/s/files/1/0607/0619/3614/files/IMG_8461.jpg?v=1787734730', true),
    ('Kids', 'kids', 'Junior streetwear and playground essentials', 'https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?auto=format&fit=crop&w=900&q=80', true),
    ('Accessories', 'accessories', 'Premium bags, jewelry, and lifestyle accessories', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, image = EXCLUDED.image, is_active = EXCLUDED.is_active;

-- 2. Insert Users (Admin & Customer demo accounts)
INSERT INTO public.users (name, email, password, phone, role, is_active)
VALUES
    ('Forma Admin', 'admin@forma.com', 'admin123', '+94 77 123 4567', 'admin', true),
    ('Aisha M.', 'aisha@forma.com', 'password123', '+94 71 987 6543', 'customer', true),
    ('Kasun Perera', 'kasun@forma.com', 'password123', '+94 70 456 7890', 'customer', true)
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Sample Addresses
INSERT INTO public.addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
SELECT
    u.id,
    u.name,
    COALESCE(u.phone, '+94 77 000 0000'),
    'No. 45 Galle Road',
    'Apartment 4B',
    'Colombo',
    'Western Province',
    '00300',
    'Sri Lanka',
    true
FROM public.users u
WHERE u.email = 'aisha@forma.com'
ON CONFLICT DO NOTHING;

-- 4. Insert Coupons
INSERT INTO public.coupons (code, type, value, min_order_amount, start_date, end_date, usage_limit, is_active)
VALUES
    ('WELCOME10', 'PERCENT', 10.00, 2000.00, timezone('utc'::text, now()), timezone('utc'::text, now() + interval '1 year'), 500, true),
    ('FORMA500', 'FIXED', 500.00, 5000.00, timezone('utc'::text, now()), timezone('utc'::text, now() + interval '6 months'), 200, true),
    ('FREESHIP', 'FIXED', 350.00, 3000.00, timezone('utc'::text, now()), timezone('utc'::text, now() + interval '1 year'), 1000, true)
ON CONFLICT (code) DO NOTHING;

-- 5. Insert Products dynamically mapped to category IDs
DO $$
DECLARE
    cat_men UUID;
    cat_women UUID;
    cat_accessories UUID;
    cat_kids UUID;

    prod_id UUID;
    var_id UUID;
    admin_id UUID;
BEGIN
    SELECT id INTO cat_men FROM public.categories WHERE slug = 'men' LIMIT 1;
    SELECT id INTO cat_women FROM public.categories WHERE slug = 'women' LIMIT 1;
    SELECT id INTO cat_accessories FROM public.categories WHERE slug = 'accessories' LIMIT 1;
    SELECT id INTO cat_kids FROM public.categories WHERE slug = 'kids' LIMIT 1;
    SELECT id INTO admin_id FROM public.users WHERE email = 'admin@forma.com' LIMIT 1;

    -- Product 1: LeagueRun Crew Neck
    INSERT INTO public.products (category_id, name, slug, description, base_price, is_featured, is_active)
    VALUES (
        cat_men,
        'LeagueRun Crew Neck',
        'leaguerun-crew-neck',
        'Easy in feel but strong in presence, combines a loose athletic silhouette with sharp two-tone detailing. Finished with statement branding.',
        4450.00,
        true,
        true
    )
    ON CONFLICT (slug) DO UPDATE SET base_price = EXCLUDED.base_price RETURNING id INTO prod_id;

    -- Images for Product 1
    INSERT INTO public.product_images (product_id, image_url, is_primary)
    VALUES 
        (prod_id, 'https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_8993_c94490be-8596-478c-992a-9d55a5235d67.jpg?v=1787891748', true),
        (prod_id, 'https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_8995_7ec38730-c22e-4db7-90a5-71d6330c5aac.jpg?v=1787891814', false)
    ON CONFLICT DO NOTHING;

    -- Variants for Product 1
    INSERT INTO public.product_variants (product_id, size, color, sku, price, stock_quantity)
    VALUES
        (prod_id, 'M', 'White/Navy', 'LR-CN-WN-M', 4450.00, 25),
        (prod_id, 'L', 'White/Navy', 'LR-CN-WN-L', 4450.00, 30),
        (prod_id, 'M', 'Navy/White', 'LR-CN-NW-M', 4450.00, 20),
        (prod_id, 'L', 'Navy/White', 'LR-CN-NW-L', 4450.00, 15)
    ON CONFLICT (sku) DO NOTHING;

    -- Product 2: LeagueRun Baby Tee
    INSERT INTO public.products (category_id, name, slug, description, base_price, is_featured, is_active)
    VALUES (
        cat_women,
        'LeagueRun Baby Tee',
        'leaguerun-baby-tee',
        'Form-fitting cropped baby tee with raglan sleeves and athletic contrast collar.',
        3750.00,
        true,
        true
    )
    ON CONFLICT (slug) DO UPDATE SET base_price = EXCLUDED.base_price RETURNING id INTO prod_id;

    INSERT INTO public.product_images (product_id, image_url, is_primary)
    VALUES 
        (prod_id, 'https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_9033.jpg?v=1787736560', true),
        (prod_id, 'https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_9030_b4dedbbc-c106-4034-9162-2be0653ce696.jpg?v=1787736607', false)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.product_variants (product_id, size, color, sku, price, stock_quantity)
    VALUES
        (prod_id, 'S', 'Maroon/White', 'LR-BT-MW-S', 3750.00, 18),
        (prod_id, 'M', 'Maroon/White', 'LR-BT-MW-M', 3750.00, 22),
        (prod_id, 'S', 'White/Navy', 'LR-BT-WN-S', 3750.00, 15),
        (prod_id, 'M', 'White/Navy', 'LR-BT-WN-M', 3750.00, 20)
    ON CONFLICT (sku) DO NOTHING;

    -- Product 3: LeagueRun Tank
    INSERT INTO public.products (category_id, name, slug, description, base_price, is_featured, is_active)
    VALUES (
        cat_men,
        'LeagueRun Tank',
        'leaguerun-tank',
        'Relaxed sleeveless silhouette with contrast shoulder detailing and deep cut armholes.',
        4450.00,
        true,
        true
    )
    ON CONFLICT (slug) DO UPDATE SET base_price = EXCLUDED.base_price RETURNING id INTO prod_id;

    INSERT INTO public.product_images (product_id, image_url, is_primary)
    VALUES 
        (prod_id, 'https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_9012_731e69f2-d488-47cb-99cf-6977745487eb.jpg?v=1787735661', true),
        (prod_id, 'https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_9009_d5c74255-9442-443c-898f-5794d488a018.jpg?v=1787735771', false)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.product_variants (product_id, size, color, sku, price, stock_quantity)
    VALUES
        (prod_id, 'M', 'Grey/White', 'LR-TK-GW-M', 4450.00, 16),
        (prod_id, 'L', 'Grey/White', 'LR-TK-GW-L', 4450.00, 14),
        (prod_id, 'M', 'White/Navy', 'LR-TK-WN-M', 4450.00, 12),
        (prod_id, 'L', 'White/Navy', 'LR-TK-WN-L', 4450.00, 20)
    ON CONFLICT (sku) DO NOTHING;

    -- Product 4: GX Tee
    INSERT INTO public.products (category_id, name, slug, description, base_price, is_featured, is_active)
    VALUES (
        cat_men,
        'GX Tee',
        'gx-tee',
        'Heavyweight oversized streetwear tee featuring high-density graphic print across the back.',
        4450.00,
        true,
        true
    )
    ON CONFLICT (slug) DO UPDATE SET base_price = EXCLUDED.base_price RETURNING id INTO prod_id;

    INSERT INTO public.product_images (product_id, image_url, is_primary)
    VALUES 
        (prod_id, 'https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_8490_7c13b2df-fc3f-41c2-a898-42103aac93ae.jpg?v=1787734609', true),
        (prod_id, 'https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_8475_ca06f8db-b439-481f-82df-b91ff9f54ff0.jpg?v=1787734832', false)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.product_variants (product_id, size, color, sku, price, stock_quantity)
    VALUES
        (prod_id, 'M', 'Jet Black', 'GX-TEE-JB-M', 4450.00, 30),
        (prod_id, 'L', 'Jet Black', 'GX-TEE-JB-L', 4450.00, 25),
        (prod_id, 'M', 'Sheer White', 'GX-TEE-SW-M', 4450.00, 20),
        (prod_id, 'L', 'Sheer White', 'GX-TEE-SW-L', 4450.00, 18)
    ON CONFLICT (sku) DO NOTHING;

    -- Product 5: Luna Linen Set
    INSERT INTO public.products (category_id, name, slug, description, base_price, is_featured, is_active)
    VALUES (
        cat_women,
        'Luna Linen Set',
        'luna-linen-set',
        'A breathable two-piece linen set cut for warm-weather days. Relaxed through the shoulder, tapered at the hem.',
        8400.00,
        false,
        true
    )
    ON CONFLICT (slug) DO UPDATE SET base_price = EXCLUDED.base_price RETURNING id INTO prod_id;

    INSERT INTO public.product_images (product_id, image_url, is_primary)
    VALUES 
        (prod_id, 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', true),
        (prod_id, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', false)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.product_variants (product_id, size, color, sku, price, stock_quantity)
    VALUES
        (prod_id, 'S', 'Beige Linen', 'LLS-BL-S', 8400.00, 10),
        (prod_id, 'M', 'Beige Linen', 'LLS-BL-M', 8400.00, 12),
        (prod_id, 'S', 'Charcoal', 'LLS-CH-S', 8400.00, 8),
        (prod_id, 'M', 'Charcoal', 'LLS-CH-M', 8400.00, 10)
    ON CONFLICT (sku) DO NOTHING;

    -- Sample Inventory Log
    SELECT id INTO var_id FROM public.product_variants WHERE sku = 'GX-TEE-JB-M' LIMIT 1;
    IF var_id IS NOT NULL THEN
        INSERT INTO public.inventory_transactions (product_id, variant_id, type, quantity, reference_id, created_by)
        VALUES (prod_id, var_id, 'IN', 30, 'PO-INITIAL-STOCK', admin_id)
        ON CONFLICT DO NOTHING;
    END IF;

END $$;

-- End of Schema Definition
