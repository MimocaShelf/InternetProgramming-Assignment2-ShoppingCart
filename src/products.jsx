function FoodCard({ food, onAdd }) {
    return (
        <div className="food-card">
            <img
                src={food.image}
                alt={`${food.name} - Freshly baked pastry`}
                className="food-image"
            />
            <div className="food-info">
                <div className="food-name">{food.name}</div>
                <div className="food-price">${formatPrice(food.price)}</div>
                <button
                    className="add-btn"
                    type="button"
                    onClick={() => onAdd(food.id)}
                    aria-label={`Add ${food.name} to cart`}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
