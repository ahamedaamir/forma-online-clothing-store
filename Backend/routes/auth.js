const express = require('express');
const router = express.Router();
const { supabase, isConfigured } = require('../supabase');

// Mock fallback in-memory users for demo
const users = [
  {
    id: 'user_1',
    name: 'Forma Admin',
    email: 'admin@forma.com',
    password: 'admin123',
    role: 'admin',
    phone: '+94 77 123 4567',
  },
  {
    id: 'user_2',
    name: 'Aisha M.',
    email: 'aisha@forma.com',
    password: 'password123',
    role: 'customer',
    phone: '+94 71 987 6543',
  },
];

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // 1. Try Supabase users table (or profiles table)
  if (isConfigured && supabase) {
    try {
      // First try users table
      let { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      // If not in users, check legacy profiles table
      if (!userProfile) {
        const { data: legacyProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();
        if (legacyProfile) userProfile = legacyProfile;
      }

      if (userProfile) {
        const storedPass = userProfile.password || userProfile.password_hash;
        if (storedPass !== password) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
          });
        }

        if (role === 'admin' && userProfile.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Admin privileges required',
          });
        }

        return res.json({
          success: true,
          message: 'Signed in successfully via Supabase',
          data: {
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            role: userProfile.role,
            phone: userProfile.phone || '',
            avatar: userProfile.avatar || '',
            token: `supabase_token_${userProfile.id}_${Date.now()}`,
          },
        });
      }
    } catch (err) {
      console.warn('Supabase user login failed, using local auth:', err.message);
    }
  }

  // 2. Local fallback
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  if (role === 'admin' && user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required',
    });
  }

  res.json({
    success: true,
    message: 'Signed in successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      token: `demo_token_${user.id}_${Date.now()}`,
    },
  });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required',
    });
  }

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name,
          email: email.toLowerCase(),
          password: password,
          phone: phone || null,
          role: 'customer',
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({
            success: false,
            message: 'An account with this email already exists',
          });
        }
        throw error;
      }

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully in Supabase',
        data: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone,
          token: `supabase_token_${data.id}_${Date.now()}`,
        },
      });
    } catch (err) {
      console.warn('Supabase registration failed, saving locally:', err.message);
    }
  }

  const existing = users.find(
    u => u.email.toLowerCase() === email.toLowerCase()
  );

  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists',
    });
  }

  const newUser = {
    id: `user_${users.length + 1}`,
    name,
    email,
    password,
    phone: phone || '',
    role: 'customer',
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: 'Account registered successfully',
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      token: `demo_token_${newUser.id}_${Date.now()}`,
    },
  });
});

module.exports = router;
