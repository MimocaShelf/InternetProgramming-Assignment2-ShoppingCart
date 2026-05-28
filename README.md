# Sweet Bakery - E-Commerce Shopping Cart
A single-page e-commerce web application that allows users to browse bakery products, add items to a shopping cart, and manage item quantities through CRUD interactions.

## Problem Solved
Small local bakeries often lack an accessible online ordering system, limiting their customer reach(?). This project provides a simple, intuitive shopping interface where customers can view products, add items to cart, adjust quantities, and even delete items from their cart. Additionally, it visualises every item the customer has bought through a pop-up list that allows users to confirm their shopping before checkout.

## Feature List
* Responsive mobile-first layout
* Add, remove, and update item quantities in the cart
* Real-time total and item count updates in the cart
* Slide-in notifications and counter when a user adds an item to cart
* Navigation buttons that automatiucally scrolls user to specific category when clicked
* Changing of color and animation when hovering over product cards and buttons
* Simple and easy to understand UI

## Folder Structure

The project is organised in one main folder, "InternetProgAssessment1", with 3 files (not including this README file) and one other folder. The Shoppingcart.html file serves as the main entry point for the application, containing the structure of the page. All styling, aesthetics and animation of the page are handled within the style.css file. Product data and shopping-cart logic, including CRUD operations, are stored in foodDatabase.js. The photos folder contains all photos/icons used for this project.

## Challenges Overcome

A key challenge I faced was continuously refining the notifications that appeared on screen. At first, each new notification when adding an item kept replacing the other one, so I had to code it so multiple, seperate notifications would pop up. However, I then realised that if I wanted to click the shopping cart after I had clicked multiple items, I had to wait for all of them to dissapear as they appeared in front of the shopping cart icon. This requierd me to adjust the positioning and spacing of the notifications. Finally, when the cart menu opened, it initially appeared on top of the shopping cart menu, meaning I couldn't see the items I had selected, not adjust the quanitity of each item. I then reworked the layering order to ensure that the cart always displayed on top and the notifications on the bottom.


