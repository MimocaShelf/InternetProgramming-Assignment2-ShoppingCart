const { useState, useEffect, useMemo } = React;

function App() {
    const [user, setUser] = useState(() => localStorage.getItem('currentUser') || '');
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || '');
    const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
    const [orders, setOrders] = useState([]);
    const [foods, setFoods] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        if (!user || isAdmin) {
            return;
        }

        fetchFoods(authToken)
            .then((data) => setFoods(data))
            .catch((error) => {
                console.error('Failed to load food data:', error);
                setFoods([]);
            });
    }, [user, authToken, isAdmin]);

    useEffect(() => {
        if (notifications.length === 0) {
            return;
        }

        const timer = setTimeout(() => {
            setNotifications((prev) => prev.slice(1));
        }, 2000);

        return () => clearTimeout(timer);
    }, [notifications]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('currentUser', user);
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [user]);

    useEffect(() => {
        if (authToken) {
            localStorage.setItem('authToken', authToken);
        } else {
            localStorage.removeItem('authToken');
        }
    }, [authToken]);

    useEffect(() => {
        if (isAdmin) {
            localStorage.setItem('isAdmin', 'true');
        } else {
            localStorage.removeItem('isAdmin');
        }
    }, [isAdmin]);

    useEffect(() => {
        document.body.classList.toggle('auth-page-active', !user);
        return () => {
            document.body.classList.remove('auth-page-active');
        };
    }, [user]);

    useEffect(() => {
        if (!isAdmin || !authToken) {
            setOrders([]);
            return;
        }

        fetchAdminOrders(authToken)
            .then((data) => setOrders(data.orders || []))
            .catch((error) => {
                console.error('Failed to load admin orders:', error);
                setOrders([]);
            });
    }, [isAdmin, authToken]);

    const handleLogin = (username, token, admin = false) => {
        setUser(username);
        setAuthToken(token || '');
        setIsAdmin(!!admin);
        setCart([]);
        setSearchTerm('');
        setNotifications([{ id: Date.now(), message: `Welcome back, ${username}!` }]);
    };

    const handleLogout = () => {
        setUser('');
        setAuthToken('');
        setIsAdmin(false);
        setOrders([]);
        setCart([]);
        setCartOpen(false);
        setSearchTerm('');
        setNotifications([]);
    };

    const searchTerms = useMemo(
        () => searchTerm.trim().toLowerCase().split(/\s+/).filter(Boolean),
        [searchTerm]
    );

    const filteredFoods = useMemo(
        () => foods.filter((food) => {
            if (searchTerms.length === 0) {
                return true;
            }

            const combinedText = `${food.name} ${food.category}`;
            return matchesSearchTerms(combinedText, searchTerms);
        }),
        [foods, searchTerms]
    );

    const categories = useMemo(() => {
        const categoryMap = {};
        filteredFoods.forEach((food) => {
            if (!categoryMap[food.category]) {
                categoryMap[food.category] = [];
            }
            categoryMap[food.category].push(food);
        });

        return Object.keys(categoryMap)
            .sort()
            .map((category) => ({ category, items: categoryMap[category] }));
    }, [filteredFoods]);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleSearchInput = (event) => setSearchTerm(event.target.value);

    const addToCart = (foodId) => {
        const food = foods.find((item) => item.id === foodId);
        if (!food) {
            return;
        }

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === foodId);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === foodId ? { ...item, quantity: item.quantity + 1 } : item
                );
            }

            return [...prevCart, { ...food, quantity: 1 }];
        });

        setNotifications((prev) => [
            ...prev,
            { id: Date.now(), message: `✓ ${food.name} added to cart!` },
        ]);
    };

    const updateQuantity = (foodId, change) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item.id === foodId ? { ...item, quantity: item.quantity + change } : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (foodId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== foodId));
    };

    const closeCart = () => setCartOpen(false);
    const toggleCart = () => setCartOpen((value) => !value);

    const checkout = () => {
        if (cartCount === 0) {
            window.alert('Your cart is empty!');
            return;
        }

        if (!authToken) {
            window.alert('Unable to checkout. Please sign in again.');
            return;
        }

        checkoutCart(cart, authToken)
            .then(() => {
                const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                window.alert(
                    `Thank you for your order! Your total for today is $${formatPrice(total)}. Thank you for shopping with us!`
                );
                setCart([]);
                setCartOpen(false);
            })
            .catch((error) => {
                window.alert(error.message || 'Unable to complete checkout.');
            });
    };

    const scrollToCategory = (category) => {
        const categoryId = `cat-${category.replace(/\s+/g, '-')}`;
        const element = document.getElementById(categoryId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (!user) {
        return <AuthPage onLogin={handleLogin} />;
    }

    if (isAdmin) {
        return <AdminDashboard user={user} onLogout={handleLogout} orders={orders} />;
    }

    return (
        <>
            <Header
                searchTerm={searchTerm}
                onSearch={handleSearchInput}
                cartCount={cartCount}
                onToggleCart={toggleCart}
                cartOpen={cartOpen}
                user={user}
                onLogout={handleLogout}
            />

            <Hero />

            <div className="container">
                <CategoryNav categories={categories} onSelectCategory={scrollToCategory} />

                <div className="food-grid" id="foodGrid">
                    {categories.length === 0 ? (
                        <p className="no-results">No products found for your search.</p>
                    ) : (
                        categories.map(({ category, items }) => (
                            <div key={category} className="category-section" id={`cat-${category.replace(/\s+/g, '-')}`}>
                                <h2 className="category-title">{category}</h2>
                                {items.map((food) => (
                                    <FoodCard key={food.id} food={food} onAdd={addToCart} />
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className={`overlay ${cartOpen ? 'active' : ''}`} id="overlay" onClick={closeCart} aria-hidden={!cartOpen}></div>

            <CartModal
                cart={cart}
                isOpen={cartOpen}
                onClose={closeCart}
                onQuantityChange={updateQuantity}
                onRemove={removeFromCart}
                onCheckout={checkout}
            />

            <Notifications notifications={notifications} />
        </>
    );
}

function AdminDashboard({ user, onLogout, orders }) {
    return (
        <>
            <header role="banner">
                <div className="header-brand">
                    <h2>
                        <img src="photos/icon.png" alt="Sweet Bakery icon" className="site-icon" /> Sweet Bakery Admin
                    </h2>
                </div>

                <div className="header-actions">
                    <div className="header-user">
                        <button className="logout-btn" type="button" onClick={onLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="admin-page">
                <div className="admin-page-intro">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome back, {user}. Review purchased orders below.</p>
                </div>

                {orders.length === 0 ? (
                    <div className="admin-empty">
                        <p>No purchased carts found yet.</p>
                    </div>
                ) : (
                <div className="admin-orders">
                    {orders.map((order) => (
                        <section key={order.orderId} className="admin-order">
                            <div className="admin-order-header">
                                <div>
                                    <span className="admin-user">Customer: {order.username}</span>
                                    <div className="admin-order-id">Order #{order.orderId}</div>
                                </div>
                                <span className="admin-date">{new Date(order.createdAt).toLocaleString()}</span>
                            </div>

                            <div className="admin-order-table">
                                <span>Item</span>
                                <span>Qty</span>
                                <span>Price</span>
                                <span>Subtotal</span>

                                {order.items.map((item, index) => (
                                    <React.Fragment key={`order-row-${order.orderId}-${item.foodId}-${index}`}>
                                        <span className="admin-order-cell-name">{item.name}</span>
                                        <span className="admin-order-cell-center">{item.quantity}</span>
                                        <span className="admin-order-cell-center">${item.price.toFixed(2)}</span>
                                        <span className="admin-order-cell-right">${(item.price * item.quantity).toFixed(2)}</span>
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className="admin-order-footer">
                                <span className="admin-total">Total: ${order.total.toFixed(2)}</span>
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
        </>
    );
}

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(<App />);
