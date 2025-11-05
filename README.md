# E-Commerce Application

A full-stack e-commerce application with React frontend and Node.js/Express backend.

## Features

- User authentication (Login/Signup)
- Product browsing
- Shopping cart functionality
- Admin panel for product management
- JWT-based authentication
- MongoDB database

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Setup Instructions

### Backend Setup

1. Navigate to the project root directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the backend server:
   ```bash
   npm run dev:backend
   ```
   Or:
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the `frntend` directory:
   ```bash
   cd frntend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## Usage

1. **Start MongoDB**: Make sure MongoDB is running on your system

2. **Start Backend**: Run `npm run dev:backend` from the root directory

3. **Start Frontend**: Run `npm run dev:frontend` from the root directory (or `npm run dev` from the frntend directory)

4. **Access the Application**: Open `http://localhost:5173` in your browser

5. **Create an Account**: Click "Login" and then "Sign up" to create a new account

6. **Admin Access**: To create an admin user, you'll need to manually update the user role in MongoDB:
   ```javascript
   db.users.updateOne({email: "your-email@example.com"}, {$set: {role: "admin"}})
   ```

## API Endpoints

### Authentication
- `POST /api/users/signup` - Register a new user
- `POST /api/users/login` - Login user

### Products
- `GET /api/products` - Get all products (public)
- `POST /api/products` - Add a product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

### Cart
- `GET /api/cart` - Get user's cart (authenticated)
- `POST /api/cart/add` - Add item to cart (authenticated)
- `POST /api/cart/remove` - Remove item from cart (authenticated)

## Project Structure

```
e-commerce/
├── backend/
│   ├── config/
│   │   └── db.js          # Database connection
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── server.js         # Express server
├── frntend/
│   ├── src/
│   │   ├── App.tsx       # Main React component
│   │   ├── main.tsx      # React entry point
│   │   └── index.css     # Global styles
│   └── vite.config.ts    # Vite configuration
└── package.json
```

## Troubleshooting

- **MongoDB Connection Error**: Ensure MongoDB is running and the connection string in `.env` is correct
- **CORS Errors**: Check that the `FRONTEND_URL` in `.env` matches your frontend URL
- **Port Already in Use**: Change the `PORT` in `.env` or stop the process using that port
- **Token Errors**: Make sure `JWT_SECRET` is set in `.env`

## Notes

- The frontend uses Vite proxy to forward `/api` requests to the backend
- All authentication is handled via JWT tokens stored in localStorage
- Admin functions require a user with `role: "admin"` in the database

