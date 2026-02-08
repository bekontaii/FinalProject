 Online Shop API

Full-stack online shop application for clothes, gadgets, and cosmetics.

 Live demo:
https://finalproject-f97z.onrender.com/

 Tech Stack

Backend: Node.js, Express.js

Database: MongoDB (Atlas)

ORM: Mongoose

Auth: JWT, bcrypt

Validation: express-validator

Frontend: HTML, CSS, Vanilla JavaScript

Deployment: Render

 User Roles

User (Buyer)

View approved products

Add products to cart

Seller

Create and manage own products

Admin



Manage all products

 Main Resources
User

name

email

password (hashed)

role (user / seller / admin)

Product

name

description

category (clothes / gadgets / cosmetics)

price

inStock

imageUrl

status (pending / approved / rejected)

owner

 Authentication

JWT-based authentication

Protected routes with role-based access

Admin role is assigned manually in database

 API Endpoints
Auth (Public)

POST /api/auth/register — register user

POST /api/auth/login — login user

User (Private)

GET /api/users/profile — get profile

PUT /api/users/profile — update profile

Products (Private)

POST /api/products — create product (seller/admin)

GET /api/products — get products (role-based)

GET /api/products/:id — get product by id

PUT /api/products/:id — update product

DELETE /api/products/:id — delete product

Admin (Admin only)

GET /api/admin/products — all products

PUT /api/admin/products/:id/status — approve or reject product

 Frontend Features

Product catalog

Category filtering

Search by name

Shopping cart (localStorage)

Role-based UI

Responsive design

Admin panel

Environment Variables

Required for deployment:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production

 Run Locally
npm install
npm start


Server runs on:

http://localhost:5000

Project Status

Authentication ✔

Authorization ✔

CRUD operations ✔

MongoDB integration ✔

Deployment ✔

 
