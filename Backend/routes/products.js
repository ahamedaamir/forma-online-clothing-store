const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { supabase, isConfigured } = require('../supabase');

const dataFilePath = path.join(__dirname, '..', 'data', 'products.json');

function mapFromSupabase(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    currency: row.currency || 'LKR',
    formattedPrice: row.formatted_price || `${row.currency || '$'} ${Number(row.price).toFixed(2)}`,
    tag: row.tag || undefined,
    image: row.image,
    hoverImage: row.hover_image || undefined,
    colorways: row.colorways || undefined,
    description: row.description || '',
    sizes: row.sizes || ['S', 'M', 'L'],
  };
}

function mapToSupabase(product) {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    currency: product.currency || 'LKR',
    formatted_price: product.formattedPrice || `${product.currency || '$'} ${Number(product.price).toFixed(2)}`,
    tag: product.tag || null,
    image: product.image,
    hover_image: product.hoverImage || null,
    colorways: product.colorways || null,
    description: product.description || '',
    sizes: product.sizes || ['S', 'M', 'L'],
    updated_at: new Date().toISOString(),
  };
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

// GET /api/products/latest-styles
router.get('/latest-styles', async (req, res) => {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('colorways', 'is', null)
        .order('id', { ascending: true })
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
      let query = supabase.from('products').select('*');

      if (category && category !== 'All') {
        query = query.ilike('category', category);
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
        query = query.order('id', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.json({
        success: true,
        count: data.length,
        data: data.map(mapFromSupabase),
      });
    } catch (err) {
      console.warn('Supabase get products failed, using local store:', err.message);
    }
  }

  let products = loadLocalProducts();

  if (category && category !== 'All') {
    products = products.filter(
      p => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
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

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  if (isConfigured && supabase) {
    try {
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

// POST /api/products (Create product)
router.post('/', async (req, res) => {
  const { slug, name, category, price, tag, image, hoverImage, colorways, description, sizes, currency, formattedPrice } = req.body;

  if (!slug || !name || !category || price === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Slug, name, category, and price are required',
    });
  }

  const newProduct = {
    slug,
    name,
    category,
    price: Number(price),
    currency: currency || 'LKR',
    formattedPrice: formattedPrice || `${currency || '$'} ${Number(price).toFixed(2)}`,
    tag: tag || undefined,
    image: image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    hoverImage: hoverImage || undefined,
    colorways: Array.isArray(colorways) ? colorways : undefined,
    description: description || '',
    sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['S', 'M', 'L'],
  };

  if (isConfigured && supabase) {
    try {
      const payload = mapToSupabase(newProduct);
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({
        success: true,
        message: 'Product created successfully in Supabase',
        data: mapFromSupabase(data),
      });
    } catch (err) {
      console.warn('Supabase product insert failed, saving locally:', err.message);
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
      const payload = mapToSupabase({ ...req.body, slug });
      const { data, error } = await supabase
        .from('products')
        .update(payload)
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
