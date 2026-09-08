const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { supabase, isConfigured } = require('../supabase');

const dataFilePath = path.join(__dirname, '..', 'data', 'products.json');

function mapFromSupabase(row) {
  if (!row) return null;

  // Extract sizes from variants or sizes column
  let sizes = ['S', 'M', 'L'];
  if (Array.isArray(row.sizes) && row.sizes.length > 0) {
    sizes = row.sizes;
  } else if (Array.isArray(row.variants) && row.variants.length > 0) {
    sizes = Array.from(new Set(row.variants.map(v => v.size).filter(Boolean)));
  }

  // Derive colorways from variants if colorways not explicitly given
  let colorways = row.colorways;
  if (!colorways && Array.isArray(row.variants) && row.variants.length > 0) {
    const colors = Array.from(new Set(row.variants.map(v => v.color).filter(Boolean)));
    colorways = colors.map(c => ({
      colorName: c,
      swatchColors: [getColorHex(c)],
      primaryImage: row.image || '',
      hoverImage: row.hover_image || row.image || '',
    }));
  }

  const basePrice = Number(row.price || row.base_price || 0);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category || 'Unisex',
    categorySlug: row.category_slug || undefined,
    price: basePrice,
    discountPrice: row.discount_price ? Number(row.discount_price) : undefined,
    currency: row.currency || 'LKR',
    formattedPrice: row.formatted_price || `LKR ${basePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    tag: row.tag || (row.is_featured ? 'Featured' : undefined),
    image: row.image,
    hoverImage: row.hover_image || undefined,
    colorways: colorways || undefined,
    description: row.description || '',
    sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L'],
    variants: row.variants || undefined,
    images: row.images || undefined,
    avgRating: row.avg_rating ? Number(row.avg_rating) : undefined,
    reviewsCount: row.reviews_count ? Number(row.reviews_count) : 0,
    isFeatured: Boolean(row.is_featured),
    isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getColorHex(colorName) {
  const map = {
    'White': '#ffffff',
    'Black': '#111111',
    'Navy': '#1b2d4f',
    'Maroon': '#681a2c',
    'Grey': '#e4e4e7',
    'Beige': '#d6c7b2',
    'Olive': '#4d533c',
    'Charcoal': '#374151',
    'Blue': '#1d4ed8',
    'Red': '#b91c1c',
  };
  return map[colorName] || '#333333';
}

function loadLocalProducts() {
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading products from file:', err.message);
    return [];
  }
}

function saveLocalProducts(products) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving products to file:', err.message);
    return false;
  }
}

// GET /api/products/categories - Fetch all categories
router.get('/categories', async (req, res) => {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return res.json({
        success: true,
        count: data.length,
        data,
      });
    } catch (err) {
      console.warn('Supabase get categories failed:', err.message);
    }
  }

  res.json({
    success: true,
    data: [
      { name: 'Men', slug: 'men' },
      { name: 'Women', slug: 'women' },
      { name: 'Unisex', slug: 'unisex' },
      { name: 'Kids', slug: 'kids' },
      { name: 'Accessories', slug: 'accessories' },
    ],
  });
});

// GET /api/products/latest-styles
router.get('/latest-styles', async (req, res) => {
  if (isConfigured && supabase) {
    try {
      // First try querying products_catalog_view
      const { data: viewData, error: viewError } = await supabase
        .from('products_catalog_view')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (!viewError && viewData && viewData.length > 0) {
        return res.json({
          success: true,
          data: viewData.map(mapFromSupabase),
        });
      }

      // Fallback query directly on products table
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      if (data && data.length > 0) {
        return res.json({
          success: true,
          data: data.map(mapFromSupabase),
        });
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local store:', err.message);
    }
  }

  const products = loadLocalProducts();
  const latest = products.filter(p => p.colorways && p.colorways.length > 0);
  res.json({
    success: true,
    data: latest.length > 0 ? latest.slice(0, 4) : products.slice(0, 4),
  });
});

// GET /api/products
router.get('/', async (req, res) => {
  const { category, search, minPrice, maxPrice, sort } = req.query;

  if (isConfigured && supabase) {
    try {
      let query = supabase.from('products_catalog_view').select('*');

      if (category && category !== 'All') {
        query = query.or(`category.ilike.%${category}%,category_slug.ilike.%${category}%`);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
      }

      if (minPrice) {
        query = query.gte('price', Number(minPrice));
      }

      if (maxPrice) {
        query = query.lte('price', Number(maxPrice));
      }

      if (sort === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (sort === 'price-desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data) {
        return res.json({
          success: true,
          count: data.length,
          data: data.map(mapFromSupabase),
        });
      }
    } catch (err) {
      console.warn('Supabase get products catalog view failed, trying standard table:', err.message);
    }

    try {
      let fallbackQuery = supabase.from('products').select('*');
      if (search) {
        fallbackQuery = fallbackQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      const { data, error } = await fallbackQuery;
      if (!error && data) {
        return res.json({
          success: true,
          count: data.length,
          data: data.map(mapFromSupabase),
        });
      }
    } catch (err) {
      console.warn('Supabase fallback query failed:', err.message);
    }
  }

  let products = loadLocalProducts();

  if (category && category !== 'All') {
    products = products.filter(
      p => p.category && p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }

  if (minPrice) {
    products = products.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    products = products.filter(p => p.price <= Number(maxPrice));
  }

  if (sort === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  }

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

// GET /api/products/:slug/reviews - Get reviews for a specific product
router.get('/:slug/reviews', async (req, res) => {
  const { slug } = req.params;

  if (isConfigured && supabase) {
    try {
      const { data: prod } = await supabase.from('products').select('id').eq('slug', slug).single();
      if (prod) {
        const { data: reviews, error } = await supabase
          .from('product_reviews')
          .select('*, users(name, avatar)')
          .eq('product_id', prod.id)
          .order('created_at', { ascending: false });

        if (!error && reviews) {
          return res.json({
            success: true,
            count: reviews.length,
            data: reviews,
          });
        }
      }
    } catch (err) {
      console.warn('Supabase get reviews failed:', err.message);
    }
  }

  res.json({
    success: true,
    count: 0,
    data: [],
  });
});

// POST /api/products/:slug/reviews - Add review
router.post('/:slug/reviews', async (req, res) => {
  const { slug } = req.params;
  const { rating, reviewText, userId } = req.body;

  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({ success: false, message: 'Valid rating between 1 and 5 is required' });
  }

  if (isConfigured && supabase) {
    try {
      const { data: prod } = await supabase.from('products').select('id').eq('slug', slug).single();
      if (prod) {
        const { data, error } = await supabase
          .from('product_reviews')
          .insert({
            product_id: prod.id,
            user_id: userId || '00000000-0000-0000-0000-000000000000',
            rating: Number(rating),
            review: reviewText || '',
            review_text: reviewText || '',
          })
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json({
          success: true,
          message: 'Review submitted successfully',
          data,
        });
      }
    } catch (err) {
      console.warn('Supabase review insert failed:', err.message);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Review recorded',
    data: { slug, rating, reviewText, createdAt: new Date().toISOString() },
  });
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  if (isConfigured && supabase) {
    try {
      // 1. Try products_catalog_view
      const { data: viewData, error: viewError } = await supabase
        .from('products_catalog_view')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!viewError && viewData) {
        return res.json({
          success: true,
          data: mapFromSupabase(viewData),
        });
      }

      // 2. Fallback to products table
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        return res.json({
          success: true,
          data: mapFromSupabase(data),
        });
      }
    } catch (err) {
      console.warn(`Supabase get product ${slug} failed:`, err.message);
    }
  }

  const products = loadLocalProducts();
  const product = products.find(p => p.slug === slug);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Product with slug '${slug}' not found`,
    });
  }

  res.json({
    success: true,
    data: product,
  });
});

// POST /api/products (Create product relationally)
router.post('/', async (req, res) => {
  const { slug, name, category, price, tag, image, hoverImage, colorways, description, sizes } = req.body;

  if (!slug || !name || price === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Slug, name, and price are required',
    });
  }

  if (isConfigured && supabase) {
    try {
      // 1. Find or create Category
      let categoryId = null;
      if (category) {
        const catSlug = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const { data: catData } = await supabase.from('categories').select('id').eq('slug', catSlug).single();
        if (catData) {
          categoryId = catData.id;
        } else {
          const { data: newCat } = await supabase
            .from('categories')
            .insert({ name: category, slug: catSlug })
            .select('id')
            .single();
          if (newCat) categoryId = newCat.id;
        }
      }

      // 2. Insert into products
      const { data: productRow, error: prodErr } = await supabase
        .from('products')
        .insert({
          category_id: categoryId,
          name,
          slug,
          description: description || '',
          base_price: Number(price),
          is_featured: tag === 'Featured' || tag === 'Trending',
          is_active: true,
        })
        .select()
        .single();

      if (prodErr) throw prodErr;

      // 3. Insert primary & hover images
      if (image && productRow) {
        await supabase.from('product_images').insert({
          product_id: productRow.id,
          image_url: image,
          is_primary: true,
        });
      }
      if (hoverImage && productRow) {
        await supabase.from('product_images').insert({
          product_id: productRow.id,
          image_url: hoverImage,
          is_primary: false,
        });
      }

      // 4. Insert variants for sizes
      const sizeList = Array.isArray(sizes) && sizes.length > 0 ? sizes : ['S', 'M', 'L'];
      const variantInserts = sizeList.map((sz, idx) => ({
        product_id: productRow.id,
        size: sz,
        color: (colorways && colorways[0]?.colorName) || 'Standard',
        sku: `${slug.toUpperCase()}-${sz}-${idx + 1}`,
        price: Number(price),
        stock_quantity: 20,
      }));

      await supabase.from('product_variants').insert(variantInserts);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully in relational database',
        data: mapFromSupabase(productRow),
      });
    } catch (err) {
      console.warn('Supabase product relational insert failed, saving locally:', err.message);
    }
  }

  const products = loadLocalProducts();
  const existing = products.find(p => p.slug === slug);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: `Product with slug '${slug}' already exists`,
    });
  }

  const newProduct = {
    slug,
    name,
    category: category || 'Unisex',
    price: Number(price),
    currency: 'LKR',
    formattedPrice: `LKR ${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    tag: tag || undefined,
    image: image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    hoverImage: hoverImage || undefined,
    colorways: Array.isArray(colorways) ? colorways : undefined,
    description: description || '',
    sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['S', 'M', 'L'],
  };

  products.unshift(newProduct);
  saveLocalProducts(products);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: newProduct,
  });
});

// PUT /api/products/:slug (Update product)
router.put('/:slug', async (req, res) => {
  const { slug } = req.params;

  if (isConfigured && supabase) {
    try {
      const updates = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.price !== undefined) updates.base_price = Number(req.body.price);
      if (req.body.tag) updates.is_featured = req.body.tag === 'Featured' || req.body.tag === 'Trending';

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('slug', slug)
        .select()
        .single();

      if (error) throw error;
      return res.json({
        success: true,
        message: 'Product updated successfully in Supabase',
        data: mapFromSupabase(data),
      });
    } catch (err) {
      console.warn(`Supabase update for ${slug} failed:`, err.message);
    }
  }

  const products = loadLocalProducts();
  const index = products.findIndex(p => p.slug === slug);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Product with slug '${slug}' not found`,
    });
  }

  const updatedProduct = {
    ...products[index],
    ...req.body,
    slug: req.body.slug || slug,
    price: req.body.price !== undefined ? Number(req.body.price) : products[index].price,
  };

  products[index] = updatedProduct;
  saveLocalProducts(products);

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct,
  });
});

// DELETE /api/products/:slug (Delete product)
router.delete('/:slug', async (req, res) => {
  const { slug } = req.params;

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('slug', slug)
        .select()
        .single();

      if (error) throw error;
      return res.json({
        success: true,
        message: 'Product deleted successfully from Supabase',
        data: mapFromSupabase(data),
      });
    } catch (err) {
      console.warn(`Supabase delete for ${slug} failed:`, err.message);
    }
  }

  let products = loadLocalProducts();
  const index = products.findIndex(p => p.slug === slug);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Product with slug '${slug}' not found`,
    });
  }

  const deleted = products.splice(index, 1)[0];
  saveLocalProducts(products);

  res.json({
    success: true,
    message: 'Product deleted successfully',
    data: deleted,
  });
});

module.exports = router;
