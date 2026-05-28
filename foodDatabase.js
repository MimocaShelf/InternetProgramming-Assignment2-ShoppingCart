// Default food database for Bakery
const defaultFoods = [
    { id: 1, name: "Croissant", price: 4.99, image: "photos/croissant.jpg", category: "Croissants & Pastries" },
    { id: 2, name: "Sourdough Bread", price: 6.99, image: "photos/sourdough.jpg", category: "Bread" },
    { id: 3, name: "Chocolate Cake", price: 8.99, image: "photos/chocolate-cake.jpg", category: "Cakes" },
    { id: 4, name: "Cinnamon Roll", price: 5.49, image: "photos/cinnamon-roll.jpg", category: "Sweet Treats" },
    { id: 5, name: "Glazed Donut", price: 3.99, image: "photos/donut.jpg", category: "Donuts & Muffins" },
    { id: 6, name: "Cheesecake", price: 7.99, image: "photos/cheesecake.jpg", category: "Cakes" },
    { id: 7, name: "Blueberry Muffin", price: 4.49, image: "photos/muffin.jpg", category: "Donuts & Muffins" },
    { id: 8, name: "Butter Bagel", price: 3.49, image: "photos/bagel.jpg", category: "Bread" },
    { id: 9, name: "Almond Croissant", price: 5.99, image: "photos/almond-croissant.jpg", category: "Croissants & Pastries" },
    { id: 10, name: "Brioche", price: 4.49, image: "photos/brioche.jpg", category: "Bread" },
    { id: 11, name: "Tiramisu", price: 6.99, image: "photos/tiramisu.jpg", category: "Cakes" },
    { id: 12, name: "Carrot Cake", price: 7.49, image: "photos/carrot-cake.jpg", category: "Cakes" },
    { id: 13, name: "Brownies", price: 4.99, image: "photos/brownies.jpg", category: "Sweet Treats" },
    { id: 14, name: "Apple Pie", price: 8.49, image: "photos/apple-pie.jpg", category: "Pies & Tarts" },
    { id: 15, name: "Macarons (Box of 6)", price: 9.99, image: "photos/macarons.jpg", category: "Sweet Treats" },
    { id: 16, name: "Rye Bread", price: 5.99, image: "photos/rye-bread.jpg", category: "Bread" },
    { id: 17, name: "Raspberry Tart", price: 6.49, image: "photos/raspberry-tart.jpg", category: "Pies & Tarts" },
    { id: 18, name: "Cronut", price: 5.49, image: "photos/cronut.jpg", category: "Croissants & Pastries" }
];

// Initialize foods from localStorage or use defaults
let foods = JSON.parse(localStorage.getItem('foods')) || defaultFoods;

// CRUD Operations

// CREATE - Add a new food item
function addFood(name, price, image) {
    const newId = foods.length > 0 ? Math.max(...foods.map(f => f.id)) + 1 : 1;
    const newFood = { id: newId, name, price, image };
    foods.push(newFood);
    saveFoods();
    return newFood;
}

// READ - Get all foods
function getAllFoods() {
    return foods;
}

// READ - Get food by ID
function getFoodById(id) {
    return foods.find(f => f.id === id);
}

// UPDATE - Update an existing food item
function updateFood(id, name, price, image) {
    const food = foods.find(f => f.id === id);
    if (food) {
        food.name = name || food.name;
        food.price = price || food.price;
        food.image = image || food.image;
        saveFoods();
        return food;
    }
    return null;
}

// DELETE - Remove a food item by ID
function deleteFood(id) {
    const index = foods.findIndex(f => f.id === id);
    if (index > -1) {
        const deletedFood = foods.splice(index, 1);
        saveFoods();
        return deletedFood[0];
    }
    return null;
}

// DELETE - Remove all foods and reset to defaults
function resetFoods() {
    foods = JSON.parse(JSON.stringify(defaultFoods));
    saveFoods();
    return foods;
}

// Helper function - Save foods to localStorage
function saveFoods() {
    localStorage.setItem('foods', JSON.stringify(foods));
}
