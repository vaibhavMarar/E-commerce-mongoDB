import React, { useEffect, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
}

interface CartItem {
  _id: string;
  productId: Product;
  quantity: number;
}

interface Cart {
  _id: string;
  userId: string;
  products: CartItem[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', description: '', stock: '' });
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchProducts();
    const token = localStorage.getItem('token');
    if (token) {
      fetchCart();
      // Try to decode user from token (basic implementation)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // In a real app, you'd fetch user data from an API
        setUser({ _id: payload.id, name: '', email: '', role: payload.role || 'user' });
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchProducts', err);
      setMessage('Failed to load products');
    }
  }

  async function fetchCart() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCart(null);
        return;
      }
      const res = await fetch('/api/cart', {
        headers: { Authorization: token },
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else if (res.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
        setCart(null);
      }
    } catch (err) {
      console.error('fetchCart', err);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, password: authForm.password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setShowAuth(false);
        setAuthForm({ name: '', email: '', password: '' });
        setMessage('Login successful! ✅');
        await fetchCart();
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error during login');
    }
    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authForm.name, email: authForm.email, password: authForm.password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setShowAuth(false);
        setAuthForm({ name: '', email: '', password: '' });
        setMessage('Signup successful! ✅');
        await fetchCart();
      } else {
        setMessage(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error during signup');
    }
    setLoading(false);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setUser(null);
    setCart(null);
    setMessage('Logged out successfully');
  }

  async function addToCart(productId: string) {
    if (!user) {
      setMessage('Please login to add items to cart');
      setShowAuth(true);
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) {
        const err = await res.json();
        setMessage(err.message || 'Failed to add to cart');
      } else {
        setMessage('Added to cart ✅');
        await fetchCart();
      }
    } catch (err) {
      console.error(err);
      setMessage('Error adding to cart');
    }
    setLoading(false);
  }

  async function removeFromCart(productId: string) {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) {
        const err = await res.json();
        setMessage(err.message || 'Failed to remove');
      } else {
        setMessage('Removed from cart ✅');
        await fetchCart();
      }
    } catch (err) {
      console.error(err);
      setMessage('Error removing item');
    }
    setLoading(false);
  }

  async function handleAdminAdd(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const body = { 
        name: form.name, 
        price: Number(form.price), 
        description: form.description, 
        stock: Number(form.stock) 
      };
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        setMessage(err.message || 'Failed to add product');
      } else {
        setMessage('Product added ✅');
        setForm({ name: '', price: '', description: '', stock: '' });
        await fetchProducts();
      }
    } catch (err) {
      console.error(err);
      setMessage('Error adding product');
    }
  }

  const totalItems = cart?.products?.reduce((s, p) => s + (p.quantity || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Simple E‑commerce</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-sm">Welcome, {user.name || user.email}</div>
                {user.role === 'admin' && (
                  <button
                    onClick={() => setIsAdminMode((s) => !s)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    {isAdminMode ? 'Switch to Shop' : 'Switch to Admin'}
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 border rounded text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                Login
              </button>
            )}
            {user && (
              <div className="text-sm">Cart: <strong>{totalItems}</strong></div>
            )}
          </div>
        </header>

        {message && (
          <div className={`mb-4 p-3 rounded text-sm ${
            message.includes('✅') || message.includes('successful') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {showAuth && !user && (
          <div className="bg-white shadow rounded p-6 mb-6 max-w-md mx-auto">
            <h2 className="font-semibold mb-4 text-xl">
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </h2>
            <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-3">
              {authMode === 'signup' && (
                <input
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  placeholder="Name"
                  className="w-full border p-2 rounded"
                  required
                />
              )}
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="Email"
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="Password"
                className="w-full border p-2 rounded"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded flex-1"
                  disabled={loading}
                >
                  {authMode === 'login' ? 'Login' : 'Sign Up'}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border rounded"
                  onClick={() => setShowAuth(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              {authMode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="text-blue-600 underline"
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-blue-600 underline"
                  >
                    Login
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {isAdminMode && user?.role === 'admin' ? (
          <div className="bg-white shadow rounded p-4 mb-6">
            <h2 className="font-semibold mb-3">Admin — Add Product</h2>
            <form onSubmit={handleAdminAdd} className="grid grid-cols-1 gap-2">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
                className="border p-2 rounded"
                required
              />
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Price"
                type="number"
                className="border p-2 rounded"
                required
              />
              <input
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="Stock"
                type="number"
                className="border p-2 rounded"
                required
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                className="border p-2 rounded"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  disabled={loading}
                >
                  Add Product
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border rounded"
                  onClick={() => {
                    setForm({ name: '', price: '', description: '', stock: '' });
                    setMessage('');
                  }}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500">No products available</div>
              ) : (
                products.map((p) => (
                  <div key={p._id} className="bg-white shadow rounded p-4 flex flex-col">
                    <h3 className="font-semibold text-lg">{p.name}</h3>
                    <div className="text-sm text-gray-600 mb-2">₹{p.price}</div>
                    <p className="text-sm text-gray-700 flex-1">{p.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-gray-500">Stock: {p.stock ?? '—'}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart(p._id)}
                          className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
                          disabled={loading}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>

            {user && (
              <section className="mt-6 bg-white shadow rounded p-4">
                <h2 className="font-semibold mb-3">Your Cart</h2>
                {!cart || !cart.products?.length ? (
                  <div className="text-sm text-gray-500">Cart is empty</div>
                ) : (
                  <div className="space-y-3">
                    {cart.products.map((it) => (
                      <div
                        key={it._id || it.productId._id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{it.productId?.name}</div>
                          <div className="text-xs text-gray-500">
                            Qty: {it.quantity} × ₹{it.productId?.price} = ₹
                            {(it.quantity * (it.productId?.price || 0)).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => removeFromCart(it.productId._id)}
                            className="px-3 py-1 border rounded text-sm hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
