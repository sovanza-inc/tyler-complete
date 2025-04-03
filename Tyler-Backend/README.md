# Tyler Backend

A Node.js backend service built with Express and Prisma, ready for deployment on Vercel.

## Features

- Authentication with JWT
- User Profile Management
- Payment Processing with Stripe
- File Upload Support
- PostgreSQL Database with Prisma ORM

## Deployment Instructions

1. **Prerequisites**
   - Node.js 14 or higher
   - A Neon PostgreSQL database
   - A Stripe account
   - A Vercel account

2. **Environment Variables**
   Set these environment variables in your Vercel project:
   ```
   DATABASE_URL=your-neon-db-url
   JWT_SECRET=your-jwt-secret
   STRIPE_SECRET_KEY=your-stripe-secret
   STRIPE_WEBHOOK_SECRET=your-webhook-secret
   NODE_ENV=production
   ```

3. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Deploy
   vercel
   ```

4. **Post-Deployment**
   - Update your frontend's API endpoint to point to your new Vercel URL
   - Update Stripe webhook endpoint in your Stripe dashboard
   - Test all endpoints to ensure they're working as expected

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/change-password` - Change password (requires auth)

### Profile
- `GET /api/profile` - Get user profile (requires auth)
- `PUT /api/profile` - Update profile (requires auth)
- `POST /api/profile/upload` - Upload profile image (requires auth)

### Payments
- `POST /api/payments/create-payment-intent` - Create payment intent (requires auth)
- `POST /api/payments/webhook` - Stripe webhook endpoint
- `GET /api/payments/history` - Get payment history (requires auth)

## Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a .env file with:
   ```
   DATABASE_URL=your-neon-db-url
   JWT_SECRET=your-jwt-secret
   STRIPE_SECRET_KEY=your-stripe-secret
   STRIPE_WEBHOOK_SECRET=your-webhook-secret
   NODE_ENV=development
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

## Database Schema

The application uses Prisma with the following models:

### User
- id (UUID)
- fullName (String)
- email (String, unique)
- password (String)
- bio (String, optional)
- phone (String, optional)
- profileImage (String, optional)
- createdAt (DateTime)
- updatedAt (DateTime)

### Payment
- id (UUID)
- amount (Float)
- currency (String)
- status (String)
- paymentIntentId (String)
- description (String)
- userId (UUID, foreign key)
- metadata (JSON)
- createdAt (DateTime)
- updatedAt (DateTime)

## Error Handling

The API returns errors in the following format:
```json
{
    "error": "Error Type",
    "message": "Detailed error message"
}
```
