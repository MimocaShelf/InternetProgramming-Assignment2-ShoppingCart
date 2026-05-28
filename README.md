# Sweet Bakery - E-Commerce Shopping Cart
A React-based single-page e-commerce shopping cart web app for a bakery. This application allows users to browse bakery products by scrolling or looking up a product, add items to a shopping cart, manage item quantities and checkout said items. In order for said customers to get to the website, they must either register or login to their account. It also allows for admins to check what customers bought and how much they spent. 

## Problem Solved
Small local bakeries often lack an accessible online ordering system, limiting their customer reach. This project provides a simple, intuitive shopping interface where customers can view products, add items to cart, adjust quantities, and even delete items from their cart. Additionally, it visualises every item the customer has bought through a pop-up list that allows users to confirm their shopping before checkout.

Moreover, it allows for the owners of the website to see what their most popular items are by being able to see what users have purchased. This will allow them to make products based on customer needs instead of just guessing.

## Technical Stack
- Frontend: React 18 + ReactDOM 18 via CDN
- JSX support: Babel Standalone (`text/babel` in `Shoppingcart.html`)
- UI: CSS modules in `src/*.css`
- Backend: Node.js + Express + SQLite3
- Authentication: `bcryptjs`, `jsonwebtoken`

## Dependencies
- Node.js and npm
- `backend/package.json` dependencies:
  - `express`
  - `sqlite3`
  - `bcryptjs`
  - `jsonwebtoken`
- Browser dependencies loaded from CDN in `Shoppingcart.html`:
  - `react@18`
  - `react-dom@18`
  - `@babel/standalone`

## How to Run
1. Open the terminal and install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Start the backend server by using said command:
   ```bash
   node server.js
   ```
3. The terminal should print the link 'http://localhost:3000/'. Paste the link in your browser and go on the app!

## Admin
If you want to test the admin function, here are the login details:
Username: admin
Password: admin123

## Folder Structure
- `/` (root)
  - `Shoppingcart.html` - main frontend entry point that loads the React app and CSS files.
  - `README.md` - project documentation.
  - `backend/` - A folder where the API server and database are stored.
  - `photos/` - Folder where images used by the site are stored.
  - `src/` - A folder where react components, logic, and CSS files are stored.

- `/backend`
  - `package.json` - backend dependency list and start script.
  - `server.js` - Express server, authentication endpoints, and checkout API.

- `/photos`
  - image files for products, icons, and UI elements.

- `/src` (all jsx and css folders needed for this website to run)
  - `app.jsx` - application root and main state management.
  - `auth.jsx` + `auth.css` - login/register form and styles.
  - `header.jsx` + `header.css` - top navigation and cart toggle UI.
  - `hero.jsx` + `hero.css` - hero section and landing content.
  - `nav.jsx` + `nav.css` - category navigation buttons.
  - `products.jsx` + `products.css` - product listing and add-to-cart actions.
  - `cart.jsx` + `cart.css` - shopping cart modal and cart item controls.
  - `notifications.jsx` + `notifications.css` - notification popups.
  - `base.jsx` + `base.css` - shared utilities, request helpers, and base page styles.


