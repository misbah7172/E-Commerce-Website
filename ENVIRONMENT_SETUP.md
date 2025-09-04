# Environment Setup Guide

This guide will help ### 🔐 Firebase Configuration
Firebase authentication is now configured via environment variables. Add these to your `.env` file:

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

To get these values:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to Project Settings > General > Your apps
4. Copy the configuration values to your `.env` file up all the required environment variables for the ShopHub e-commerce application.

## Quick Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required values in `.env` (see sections below)

## Required Environment Variables

### 🗄️ Database (Required)
```env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```
- **Where to get**: Create a PostgreSQL database (recommended: [Neon](https://neon.tech/))
- **Example**: `postgresql://user:pass@ep-example.neon.tech/dbname?sslmode=require`

### 🛠️ Server Configuration (Required)
```env
NODE_ENV=development
PORT=3000
```
- **NODE_ENV**: Set to `development` for local, `production` for live
- **PORT**: Server port (default: 3000)

## Payment Providers

### 💳 Stripe (Required for payments)
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```
- **Where to get**: [Stripe Dashboard](https://dashboard.stripe.com/)
- **Setup**: Create account → Get API keys → Use test keys for development

### 💰 PayPal (Required for PayPal payments)
```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
```
- **Where to get**: [PayPal Developer](https://developer.paypal.com/)
- **Setup**: Create app → Get credentials → Use sandbox for development

## Authentication

### 🔐 Firebase (Configured in code)
Firebase is configured directly in `client/src/lib/firebase.ts`. To set up:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication → Email/Password + Google Sign-in
4. Update the config in `firebase.ts` with your project details

## Optional Services

### 📧 Email Service
```env
EMAIL_SERVICE_API_KEY=your_key
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```
- **Recommended**: SendGrid, Mailgun, or AWS SES
- **Used for**: Order confirmations, password resets

### 📁 File Storage
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
```
- **Used for**: Product images, user uploads
- **Alternative**: Can use Firebase Storage

### 🗺️ External APIs
```env
SHIPPING_API_KEY=your_shipping_key
GOOGLE_MAPS_API_KEY=your_maps_key
```
- **Shipping**: For real-time shipping calculations
- **Maps**: For address validation and store locations

### 🔒 Security
```env
JWT_SECRET=your_long_random_string_here
SESSION_SECRET=another_long_random_string_here
```
- **Generate with**: `openssl rand -hex 32`
- **Used for**: Token signing and session encryption

### 📊 Analytics
```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```
- **Where to get**: [Google Analytics](https://analytics.google.com/)
- **Used for**: Tracking user behavior and sales

## Environment Setup by Use Case

### 🚀 Minimal Setup (Just to run the app)
```env
DATABASE_URL=your_database_url
NODE_ENV=development
PORT=3000
STRIPE_SECRET_KEY=sk_test_placeholder
PAYPAL_CLIENT_ID=placeholder
PAYPAL_CLIENT_SECRET=placeholder
```

### 💼 Production Setup
- All required variables above
- Set `NODE_ENV=production`
- Use production API keys (not test keys)
- Set strong JWT and session secrets
- Enable analytics and monitoring

### 🛒 Full E-commerce Setup
- All variables including optional ones
- Email service for notifications
- File storage for product images
- Shipping API for real-time rates
- Maps API for address validation

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit `.env` to version control**
2. **Use different keys for development vs production**
3. **Rotate secrets regularly**
4. **Use environment-specific databases**
5. **Enable 2FA on all service accounts**

## Troubleshooting

### Common Issues:

1. **"Missing required env var"**: Check if the variable is set in `.env`
2. **"Invalid API key"**: Verify the key is correct and active
3. **Database connection error**: Check DATABASE_URL format and connectivity
4. **Payment errors**: Ensure you're using the right keys (test vs live)

### Debug Commands:
```bash
# Check if environment variables are loaded
node -e "console.log(process.env.DATABASE_URL)"

# Test database connection
npm run db:push

# Test Stripe connection
node -e "const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); console.log('Stripe configured')"
```

## Support

If you need help setting up any of these services:

1. Check the service's official documentation
2. Look for "Getting Started" or "Quick Start" guides
3. Most services offer free tiers for development
4. Contact support if you encounter issues

---

**Next Steps**: After setting up your environment variables, run `npm run dev` to start the development server!
