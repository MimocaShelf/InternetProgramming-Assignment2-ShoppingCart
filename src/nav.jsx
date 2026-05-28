function CategoryNav({ categories, onSelectCategory }) {
    return (
        <nav className="category-nav" id="categoryNav">
            {categories.map(({ category }) => (
                <button
                    key={category}
                    type="button"
                    className="category-link"
                    onClick={() => onSelectCategory(category)}
                >
                    {category}
                </button>
            ))}
        </nav>
    );
}
