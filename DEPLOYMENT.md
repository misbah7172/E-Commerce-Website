# 🚀 Deploying E-Commerce Platform to Render

This guide will walk you through deploying your full-stack e-commerce application to Render.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Environment Variables**: Prepare your Firebase, Stripe, and other API keys

## 🔧 Deployment Steps

### Step 1: Prepare Your Repository

1. Make sure all your code is committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

### Step 2: Set Up Database on Render

1. **Create PostgreSQL Database**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "PostgreSQL"
   - Configure:
     - **Name**: `ecommerce-db`
     - **Database**: `ecommerce`
     - **User**: `ecommerce_user`
     - **Region**: Choose closest to your users
     - **Plan**: Free (or paid for production)

2. **Get Database URL**:
   - After creation, copy the "External Database URL"
   - It will look like: `postgresql://username:password@host:port/database`

### Step 3: Create Web Service

1. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `ecommerce-app`
     - **Environment**: `Node`
     - **Region**: Same as database
     - **Branch**: `main`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

### Step 4: Configure Environment Variables

Add these environment variables in Render dashboard:

#### Required Variables:
```bash
NODE_ENV=production
DATABASE_URL=[Your PostgreSQL URL from Step 2]
```

#### Firebase Configuration:
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Payment Configuration (Optional):
```bash
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

### Step 5: Initialize Database

After deployment, run database migrations:

1. **Using Render Shell**:
   - Go to your web service dashboard
   - Click "Shell" tab
   - Run: `npm run db:push`

2. **Or add to build script** (automatic):
   - The build process can include database setup

### Step 6: Custom Domain (Optional)

1. **Add Custom Domain**:
   - Go to your web service settings
   - Click "Custom Domains"
   - Add your domain (e.g., `yourdomain.com`)
   - Update DNS records as instructed

## 🛠️ Configuration Files Created

- **`render.yaml`**: Infrastructure as Code for Render
- **`build.sh`**: Custom build script
- **`start.sh`**: Custom start script
- **Health Check**: `/api/health` endpoint for monitoring

## 🔍 Environment-Specific Configurations

### Production Optimizations:

1. **Server Configuration**:
   - Listens on `0.0.0.0` in production
   - Health check endpoint for monitoring
   - Proper error handling

2. **Build Optimizations**:
   - Vite production build
   - Asset optimization
   - Tree shaking enabled

3. **Security**:
   - HTTPS enforced by Render
   - Environment variables secure
   - CORS properly configured

## 📊 Monitoring and Logs

### Access Logs:
- **Build Logs**: Available during deployment
- **Application Logs**: Real-time in Render dashboard
- **Health Check**: Monitor at `/api/health`

### Troubleshooting:
```bash
# Check application health
curl https://your-app.onrender.com/api/health

# View logs in Render dashboard
# Go to your service → Logs tab
```

## 🚀 Deployment Checklist

- [ ] ✅ Code pushed to GitHub
- [ ] ✅ PostgreSQL database created
- [ ] ✅ Web service configured
- [ ] ✅ Environment variables set
- [ ] ✅ Database schema deployed
- [ ] ✅ Health check working
- [ ] ✅ Custom domain configured (optional)
- [ ] ✅ SSL certificate active

## 🔄 Continuous Deployment

Every push to your `main` branch will automatically trigger a new deployment on Render.

### Auto-Deploy Features:
- **GitHub Integration**: Automatic deploys on push
- **Build Caching**: Faster subsequent deployments
- **Zero-Downtime**: Rolling deployments
- **Rollback**: Easy rollback to previous versions

## 💡 Cost Optimization

### Free Tier Limitations:
- **Web Service**: Spins down after 15 minutes of inactivity
- **Database**: 1GB storage limit
- **Bandwidth**: 100GB/month

### Upgrade to Paid Plans for:
- **Always-on services**
- **More storage and bandwidth**
- **Better performance**
- **Priority support**

## 🎯 Post-Deployment Steps

1. **Test All Features**:
   - User registration/login
   - Product browsing
   - Cart functionality
   - Checkout process (test mode)
   - Admin panel

2. **Configure Production Settings**:
   - Update Stripe to live keys (for real payments)
   - Set up proper email service
   - Configure backup strategy
   - Set up monitoring alerts

3. **Performance Monitoring**:
   - Monitor response times
   - Check error rates
   - Monitor database performance
   - Set up uptime monitoring

## 🔗 Useful Links

- **Your App**: `https://your-app-name.onrender.com`
- **Health Check**: `https://your-app-name.onrender.com/api/health`
- **Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)
- **Documentation**: [render.com/docs](https://render.com/docs)

---

Your e-commerce platform is now ready for production on Render! 🎉

For any issues, check the Render logs and ensure all environment variables are properly set.