const { useState, useEffect, useMemo } = React;

function App() {
    const [orders, setOrders] = useState([]);
    const [foods, setFoods] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        if (notifications.length === 0) {
            return;
        }

        const timer = setTimeout(() => {
            setNotifications((prev) => prev.slice(1));
        }, 2000);

        return () => clearTimeout(timer);
    }, [notifications]);

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

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(<App />);
