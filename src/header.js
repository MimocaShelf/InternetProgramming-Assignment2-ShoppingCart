function Header({ searchTerm, onSearch, cartCount, onToggleCart, cartOpen, user, onLogout }) {
    return (
        <header className={cartOpen ? 'cart-open' : ''} role="banner">
            <div className="header-brand">
                <h2>
                    <img src="photos/icon.png" alt="Sweet Bakery icon" className="site-icon" /> Sweet Bakery
                </h2>
            </div>

            <div className="header-search">
                <input
                    id="productSearch"
                    className="search-input"
                    type="search"
                    placeholder="Search products..."
                    aria-label="Search products"
                    value={searchTerm}
                    onChange={onSearch}
                />
            </div>

            <div className="header-actions">
                <button
                    className="cart-icon"
                    onClick={onToggleCart}
                    aria-label="Open shopping cart"
                    aria-expanded={cartOpen}
                >
                    <img src="../photos/cart-icon.png" alt="Shopping cart" className="cart-image" />
                    <span className="cart-count" id="cartCount" aria-label="Items in cart">
                        {cartCount}
                    </span>
                </button>
            </div>
        </header>
    );
}
