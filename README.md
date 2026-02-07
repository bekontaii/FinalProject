## Online Shop API (Clothes, Gadgets, Cosmetics)

Full-stack online shop application themed around clothes, gadgets, and cosmetics.  
Built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**, with a modern **HTML/CSS/JS** frontend inspired by ASOS design, following the final project requirements (`Final Project Requirements.pdf`).

### Project Overview

- **Tech stack**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, express-validator.
- **User Roles**: 
  - **User (Buyer)**: Browse and purchase approved products, manage shopping cart
  - **Seller**: Create, edit, and manage their own products (pending admin approval)
  - **Admin**: Approve/reject products, manage all products
- **Resources**:
  - `User`: name, email, password (hashed), role (user/seller/admin)
  - `Product`: name, description, category (clothes/gadgets/cosmetics), price, inStock, imageUrl, status (pending/approved/rejected), owner
- **Features**:
  - JWT-based authentication with role-based access control
  - Shopping cart (localStorage-based)
  - Product image support
  - Admin moderation panel
  - Separate login/register page
  - Modern, responsive UI design

### Setup & Installation

1. Clone the project and install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

3. Run the server:

```bash
npm run dev
# or
npm start
```

The API will be available at `http://localhost:5000`.  
The frontend shop UI will be available at:
- **Main Shop**: `http://localhost:5000/` - Browse products, manage cart
- **Login/Register**: `http://localhost:5000/login.html` - Authentication page
- **Admin Panel**: `http://localhost:5000/admin.html` - Product moderation (admin only)

### API Documentation

All JSON bodies are sent with `Content-Type: application/json`.  
Protected routes require an `Authorization: Bearer <token>` header from the login/register response.

#### 1. Authentication Routes (Public)

- **Register**
  - **Method**: `POST`
  - **Endpoint**: `/api/auth/register`
  - **Body**:
    ```json
    {
      "name": "Alice",
      "email": "alice@example.com",
      "password": "secret123",
      "role": "user"
    }
    ```
  - **Note**: `role` can be `"user"` (buyer) or `"seller"`. Admin role must be set manually in database.
  - **Response**: user data + JWT token.

- **Login**
  - **Method**: `POST`
  - **Endpoint**: `/api/auth/login`
  - **Body**:
    ```json
    {
      "email": "alice@example.com",
      "password": "secret123"
    }
    ```
  - **Response**: user data + JWT token.

#### 2. User Routes (Private)

- **Get Profile**
  - **Method**: `GET`
  - **Endpoint**: `/api/users/profile`
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: current user info.

- **Update Profile**
  - **Method**: `PUT`
  - **Endpoint**: `/api/users/profile`
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**:
    ```json
    {
      "name": "Alice Updated"
    }
    ```
  - **Response**: updated user info.

#### 3. Product Routes (Second Resource, Private)

Base path: `/api/products`

- **Create Product** (Seller/Admin only)
  - **Method**: `POST`
  - **Endpoint**: `/api/products`
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**:
    ```json
    {
      "name": "Red T-Shirt",
      "description": "Comfortable cotton t-shirt",
      "category": "clothes",
      "price": 19.99,
      "inStock": true,
      "imageUrl": "https://example.com/image.jpg"
    }
    ```
  - **Note**: New products start with `status: "pending"` and require admin approval.

- **Get All Products**
  - **Method**: `GET`
  - **Endpoint**: `/api/products`
  - **Headers**: `Authorization: Bearer <token>`
  - **Note**: 
    - **Users** see only `approved` products
    - **Sellers** see only their own products
    - **Admins** see all products

- **Get Product by ID**
  - **Method**: `GET`
  - **Endpoint**: `/api/products/:id`
  - **Headers**: `Authorization: Bearer <token>`

- **Update Product**
  - **Method**: `PUT`
  - **Endpoint**: `/api/products/:id`
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: any subset of:
    ```json
    {
      "name": "New Name",
      "description": "Updated desc",
      "category": "gadgets",
      "price": 29.99,
      "inStock": false
    }
    ```

- **Delete Product** (Owner or Admin only)
  - **Method**: `DELETE`
  - **Endpoint**: `/api/products/:id`
  - **Headers**: `Authorization: Bearer <token>`

#### 4. Admin Routes (Admin only)

- **Get All Products for Moderation**
  - **Method**: `GET`
  - **Endpoint**: `/api/admin/products`
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: All products with owner information

- **Update Product Status**
  - **Method**: `PUT`
  - **Endpoint**: `/api/admin/products/:id/status`
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**:
    ```json
    {
      "status": "approved"
    }
    ```
  - **Note**: `status` can be `"pending"`, `"approved"`, or `"rejected"`

### Frontend Features

- **Shopping Cart**: Add products to cart, view cart in sidebar, checkout (localStorage-based)
- **Product Filtering**: Filter by category (All, Clothes, Gadgets, Cosmetics)
- **Search**: Search products by name or description
- **Role-based UI**: 
  - Users see "Add to Bag" buttons
  - Sellers see product management section
  - Admins see link to admin panel
- **Product Images**: Display product images in grid and cart
- **Responsive Design**: Works on desktop and mobile devices

### Validation & Error Handling

- Uses `express-validator` to validate fields like email, password, product name, category, and price.
- Global error handling middleware:
  - Returns **400** for validation errors.
  - Returns **401** for unauthorized access (missing/invalid token).
  - Returns **404** when a resource is not found.
  - Returns **500** for server errors.

### Notes for Deployment

- Set `MONGO_URI`, `JWT_SECRET`, and `NODE_ENV=production` in your hosting platform (Render, Railway, etc.).
- Use `npm start` as your start command.

