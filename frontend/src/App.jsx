import { useEffect, useMemo, useState } from 'react'
import './App.css'

const seedProducts = [
  { _id: 'p1', name: 'Arc Table Lamp', category: 'Lighting', price: 148, compareAt: 185, rating: 4.9, badge: 'BESTSELLER', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85', description: 'A quiet statement in brushed brass and hand-blown glass. Warm, adjustable light for the corners you love most.' },
  { _id: 'p2', name: 'Form Lounge Chair', category: 'Furniture', price: 640, rating: 4.8, badge: 'NEW', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=85', description: 'Sculpted oak, generous proportions, and a linen seat made for lingering. Designed to age beautifully.' },
  { _id: 'p3', name: 'Everyday Ceramic Set', category: 'Tableware', price: 72, rating: 5.0, image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=900&q=85', description: 'Four hand-finished stoneware pieces with a soft, tactile glaze. Made for weekday breakfasts and long dinners.' },
  { _id: 'p4', name: 'Loom Throw Blanket', category: 'Textiles', price: 126, rating: 4.7, image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85', description: 'Woven from responsibly sourced cotton with a relaxed fringe edge. An easy extra layer for the sofa or bed.' },
  { _id: 'p5', name: 'Sculptural Oak Stool', category: 'Furniture', price: 225, rating: 4.9, image: 'https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=900&q=85', description: 'A solid oak accent stool with a carved seat and softened edges. Equally at home beside a chair or in an entryway.' },
  { _id: 'p6', name: 'Ripple Glass Vase', category: 'Objects', price: 58, rating: 4.8, badge: 'LOW STOCK', image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85', description: 'A softly rippled glass silhouette that catches the light beautifully, with or without a few stems.' },
  { _id: 'p7', name: 'Arc Wall Sconce', category: 'Lighting', price: 186, rating: 4.6, image: 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=900&q=85', description: 'A considered wall light with a compact profile and a generous pool of ambient light. Hardware included.' },
  { _id: 'p8', name: 'Tapered Oak Side Table', category: 'Furniture', price: 310, rating: 4.9, image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=900&q=85', description: 'A minimal side table in warm solid oak, finished by hand and built to stay in your home for years.' },
]

const categories = ['All pieces', 'Furniture', 'Lighting', 'Tableware', 'Textiles', 'Objects']
const money = (amount) => `$${Number(amount).toFixed(2)}`

function App() {
  const [products, setProducts] = useState(seedProducts)
  const [activeCategory, setActiveCategory] = useState('All pieces')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('featured')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('morrow-cart') || '[]'))
  const [cartOpen, setCartOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('morrow-user') || 'null'))
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [checkout, setCheckout] = useState(false)

  useEffect(() => {
    fetch('/api/products').then((response) => response.ok ? response.json() : []).then((data) => {
      if (data.length) setProducts(data)
    }).catch(() => {})
  }, [])

  useEffect(() => localStorage.setItem('morrow-cart', JSON.stringify(cart)), [cart])

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => (activeCategory === 'All pieces' || product.category === activeCategory) && `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price)
    if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price)
    return filtered
  }, [products, activeCategory, search, sort])

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  function addToCart(product, quantity = 1) {
    setCart((items) => {
      const existing = items.find((item) => item._id === product._id)
      return existing
        ? items.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...items, { ...product, quantity }]
    })
    setNotice(`${product.name} added to your bag`)
    window.setTimeout(() => setNotice(''), 2400)
  }

  function updateQuantity(id, amount) {
    setCart((items) => items.map((item) => item._id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0))
  }

  async function submitAuth(event) {
    event.preventDefault()
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    try {
      const response = await fetch(`/api/auth/${authMode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to sign in')
      localStorage.setItem('morrow-user', JSON.stringify(data))
      setUser(data)
      setAuthOpen(false)
      setNotice(`Welcome${data.name ? `, ${data.name.split(' ')[0]}` : ''}`)
      window.setTimeout(() => setNotice(''), 2400)
    } catch (error) {
      setNotice(error.message === 'Failed to fetch' ? 'Start the backend and connect MongoDB to use accounts.' : error.message)
      window.setTimeout(() => setNotice(''), 3600)
    } finally {
      setBusy(false)
    }
  }

  async function placeOrder(event) {
    event.preventDefault()
    if (!user?.token) {
      setCheckout(false)
      setAuthMode('login')
      setAuthOpen(true)
      setNotice('Sign in to complete your order')
      window.setTimeout(() => setNotice(''), 2800)
      return
    }
    setBusy(true)
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ items: cart.map(({ _id, quantity }) => ({ product: _id, quantity })), shippingAddress: Object.fromEntries(form.entries()) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not place order')
      setCart([])
      setCheckout(false)
      setCartOpen(false)
      setNotice(`Order ${data._id.slice(-6).toUpperCase()} placed. Thank you!`)
      window.setTimeout(() => setNotice(''), 4500)
    } catch (error) {
      setNotice(error.message)
      window.setTimeout(() => setNotice(''), 3500)
    } finally {
      setBusy(false)
    }
  }

  function signOut() {
    localStorage.removeItem('morrow-user')
    setUser(null)
    setNotice('You have signed out')
    window.setTimeout(() => setNotice(''), 2200)
  }

  return (
    <div className="store">
      <div className="announcement">A little more considered. A lot more lived in. <span>Free shipping over $150</span></div>
      <header className="site-header">
        <a className="wordmark" href="#home" onClick={() => setSelectedProduct(null)}>morrow<span>.</span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#collection" onClick={() => { setActiveCategory('All pieces'); setSelectedProduct(null) }}>Shop all</a>
          <a href="#collection" onClick={() => { setActiveCategory('Furniture'); setSelectedProduct(null) }}>Furniture</a>
          <a href="#collection" onClick={() => { setActiveCategory('Lighting'); setSelectedProduct(null) }}>Lighting</a>
          <a href="#story">Our approach</a>
        </nav>
        <div className="header-actions">
          <button className="account-button" onClick={() => user ? signOut() : (setAuthMode('login'), setAuthOpen(true))} aria-label={user ? 'Sign out' : 'Sign in'}>{user ? 'Sign out' : 'Sign in'}</button>
          <button className="bag-button" onClick={() => setCartOpen(true)} aria-label={`Open bag, ${cartCount} items`}><span>Bag</span><span className="bag-count">{cartCount}</span></button>
        </div>
      </header>

      {!selectedProduct ? <>
        <main id="home">
          <section className="hero-section">
            <div className="hero-copy">
              <p className="eyebrow">A slower kind of living</p>
              <h1>Make room<br />for <em>the good</em>.</h1>
              <p className="hero-description">Thoughtful objects for everyday rituals. Made to be held onto, not hurried through.</p>
              <a className="dark-button" href="#collection">Explore the collection <span>↗</span></a>
              <div className="hero-footnote"><span className="tiny-star">✳</span> Considered materials, always.</div>
            </div>
            <div className="hero-image-wrap">
              <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=90" alt="Warm, sunlit living room with thoughtful furniture and natural textures" />
              <div className="image-caption"><span>01 / 04</span><span>A place to land</span></div>
              <div className="round-stamp">LIVE<br />A LITTLE<br />LIGHTER</div>
            </div>
            <div className="hero-index">IN GOOD COMPANY <span>— EST. 2021</span></div>
          </section>

          <section className="shop-section" id="collection">
            <div className="section-heading">
              <div><p className="eyebrow">The considered edit</p><h2>Things for <em>your place.</em></h2></div>
              <p className="section-note">Useful, beautiful, and better with time.<br />Meet your new everyday favorites.</p>
            </div>
            <div className="shop-controls">
              <div className="category-tabs" role="tablist" aria-label="Filter by category">
                {categories.map((category) => <button key={category} className={activeCategory === category ? 'category-tab active' : 'category-tab'} onClick={() => setActiveCategory(category)}>{category}</button>)}
              </div>
              <div className="catalog-tools">
                <label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Search products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find something" /></label>
                <select aria-label="Sort products" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select>
              </div>
            </div>
            <div className="product-grid">
              {visibleProducts.map((product, index) => <article className="product-card" key={product._id} style={{ animationDelay: `${index * 55}ms` }}>
                <button className="product-image-button" onClick={() => { setSelectedProduct(product); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label={`View ${product.name}`}>
                  <img className="product-image" src={product.image} alt={product.name} loading="lazy" />
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <span className="quick-add" onClick={(event) => { event.stopPropagation(); addToCart(product) }} aria-label={`Add ${product.name} to bag`}>+</span>
                </button>
                <div className="product-meta"><div><p className="product-category">{product.category}</p><button className="product-name" onClick={() => setSelectedProduct(product)}>{product.name}</button></div><span className="product-price">{money(product.price)}</span></div>
                <p className="product-rating">★ <span>{product.rating || '4.8'} · Thoughtfully made</span></p>
              </article>)}
              {visibleProducts.length === 0 && <p className="empty-results">Nothing here just yet. Try another search.</p>}
            </div>
          </section>

          <section className="story-section" id="story">
            <div className="story-image"><img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85" alt="Natural materials and considered home details" loading="lazy" /></div>
            <div className="story-copy"><p className="eyebrow">Less, but more meaningful</p><h2>Good things<br />take <em>their time.</em></h2><p>We work with small workshops and thoughtful makers to create pieces that earn their place in your home. Honest materials. Useful forms. No rush.</p><a href="#collection" className="text-link">A little about us <span>↗</span></a><span className="story-number">02 — OUR APPROACH</span></div>
          </section>
          <section className="service-strip"><div><span>01</span><p>Made with intention</p></div><div><span>02</span><p>Free shipping over $150</p></div><div><span>03</span><p>30 days to find your fit</p></div><div><span>04</span><p>Here for the long run</p></div></section>
        </main>
        <footer className="site-footer"><a className="wordmark" href="#home">morrow<span>.</span></a><p>For the life you live at home.</p><span>© 2026 Morrow Objects</span></footer>
      </> : <main className="detail-page">
        <button className="back-link" onClick={() => setSelectedProduct(null)}>← Back to the collection</button>
        <div className="detail-layout"><div className="detail-image"><img src={selectedProduct.image} alt={selectedProduct.name} /></div><div className="detail-copy"><p className="eyebrow">{selectedProduct.category} · Morrow essentials</p><h1>{selectedProduct.name}</h1><p className="detail-rating">★ {selectedProduct.rating || '4.8'} <span>· Loved in real homes</span></p><p className="detail-price">{money(selectedProduct.price)}</p><p className="detail-description">{selectedProduct.description || 'Made with care using considered materials and designed for everyday living. A beautiful, lasting addition to your home.'}</p><div className="detail-facts"><p><span>Materials</span> Responsibly sourced, carefully finished</p><p><span>Delivery</span> Complimentary over $150</p><p><span>Returns</span> 30 days to find your fit</p></div><button className="dark-button add-detail" onClick={() => { addToCart(selectedProduct); setCartOpen(true) }}>Add to bag — {money(selectedProduct.price)} <span>↗</span></button><p className="detail-note">A little something you'll keep for a long time.</p></div></div>
      </main>}

      {notice && <div className="toast" role="status">{notice}</div>}
      {cartOpen && <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && setCartOpen(false)}><aside className="side-panel" aria-label="Shopping bag"><div className="panel-heading"><div><p className="eyebrow">Your good things</p><h2>Your bag <span>({cartCount})</span></h2></div><button className="close-button" onClick={() => { setCartOpen(false); setCheckout(false) }} aria-label="Close bag">×</button></div>
        {checkout ? <form className="checkout-form" onSubmit={placeOrder}><button type="button" className="back-link" onClick={() => setCheckout(false)}>← Back to bag</button><h3>Delivery details</h3><label>Full name<input name="name" required defaultValue={user?.name || ''} /></label><label>Email address<input name="email" type="email" required defaultValue={user?.email || ''} /></label><label>Street address<input name="street" required /></label><div className="form-row"><label>City<input name="city" required /></label><label>Postal code<input name="postalCode" required /></label></div><label>Country<input name="country" required /></label><button className="dark-button checkout-submit" disabled={busy}>{busy ? 'Placing order…' : `Place order · ${money(subtotal)}`} <span>↗</span></button><p className="secure-note">Sign in is required to place and track your order.</p></form> : <>
          <div className="bag-items">{cart.length ? cart.map((item) => <div className="bag-item" key={item._id}><img src={item.image} alt="" /><div className="bag-item-info"><p className="product-category">{item.category}</p><h3>{item.name}</h3><span>{money(item.price)}</span><div className="quantity-control"><button onClick={() => updateQuantity(item._id, -1)} aria-label={`Remove one ${item.name}`}>−</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item._id, 1)} aria-label={`Add one ${item.name}`}>+</button></div></div><button className="remove-item" onClick={() => updateQuantity(item._id, -item.quantity)} aria-label={`Remove ${item.name}`}>×</button></div>) : <div className="empty-bag"><span>✳</span><h3>A little room for something good.</h3><p>Your bag is waiting for its first favorite.</p><button className="text-link" onClick={() => { setCartOpen(false); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }) }}>Explore the collection ↗</button></div>}</div>
          {cart.length > 0 && <div className="bag-summary"><p><span>Subtotal</span><strong>{money(subtotal)}</strong></p><p><span>Shipping</span><span>{subtotal >= 150 ? 'On us' : 'Calculated at checkout'}</span></p><button className="dark-button checkout-button" onClick={() => setCheckout(true)}>Continue to checkout <span>↗</span></button><p className="secure-note">Taxes and shipping calculated at checkout.</p></div>}
        </>}</aside></div>}
      {authOpen && <div className="overlay modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && setAuthOpen(false)}><section className="auth-modal" aria-label={authMode === 'login' ? 'Sign in' : 'Create account'}><button className="close-button modal-close" onClick={() => setAuthOpen(false)} aria-label="Close">×</button><p className="eyebrow">A familiar place</p><h2>{authMode === 'login' ? 'Welcome back.' : 'Make yourself at home.'}</h2><p className="auth-intro">{authMode === 'login' ? 'Sign in to pick up where you left off.' : 'A few details and you’re all set.'}</p><form onSubmit={submitAuth}>{authMode === 'register' && <label>Your name<input name="name" autoComplete="name" required /></label>}<label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength="8" required /></label><button className="dark-button auth-submit" disabled={busy}>{busy ? 'One moment…' : authMode === 'login' ? 'Sign in' : 'Create account'} <span>↗</span></button></form><p className="auth-switch">{authMode === 'login' ? 'New around here?' : 'Already have an account?'} <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Create account' : 'Sign in'}</button></p><p className="auth-hint">Accounts and orders are securely stored by the Morrow server.</p></section></div>}
    </div>
  )
}

export default App
