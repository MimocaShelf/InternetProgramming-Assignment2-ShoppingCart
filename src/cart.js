function CartModal({ cart, isOpen, onClose, onQuantityChange, onRemove, onCheckout }) {
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className={`cart-modal ${isOpen ? 'active' : ''}`} id="cartModal" role="dialog" aria-labelledby="cart-title" aria-hidden={!isOpen}>
            <div className="cart-header">
                <h2 id="cart-title">Shopping Cart</h2>
                <button className="close-cart" type="button" onClick={onClose} aria-label="Close shopping cart">
                    ×
                </button>
            </div>

            {cart.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                cart.map((item) => (
                    <div key={item.id} className="cart-item">
                        <div className="cart-item-info">
                            <div className="cart-item-name">{item.name}</div>
                            <div className="cart-item-price">${formatPrice(item.price)}</div>
                        </div>
                        <div className="cart-item-qty">
                            <button className="qty-btn" type="button" onClick={() => onQuantityChange(item.id, -1)} aria-label={`Decrease quantity of ${item.name}`}>
                                -
                            </button>
                            <span aria-label={`${item.quantity} ${item.name} in cart`}>{item.quantity}</span>
                            <button className="qty-btn" type="button" onClick={() => onQuantityChange(item.id, 1)} aria-label={`Increase quantity of ${item.name}`}>
                                +
                            </button>
                        </div>
                        <button className="remove-btn" type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name} from cart`}>
                            <img src="photos/trash.png" alt="Remove" className="trash-icon" />
                        </button>
                    </div>
                ))
            )}

            <div className="cart-total">Total: ${formatPrice(cartTotal)}</div>
            <button className="checkout-btn" type="button" onClick={onCheckout}>
                Checkout
            </button>
        </div>
    );
}
