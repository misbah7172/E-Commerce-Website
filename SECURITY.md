# 🔒 Security Guidelines

## Environment Variables

This project uses environment variables to store sensitive configuration data. **Never commit your `.env` file to version control.**

### ✅ What's Safe for GitHub

- `.env.example` - Template with placeholder values
- Code that references `process.env.VARIABLE_NAME` or `import.meta.env.VITE_VARIABLE_NAME`
- Configuration using environment variables

### ❌ Never Commit These

- `.env` file with actual values
- API keys, secrets, passwords
- Database connection strings with credentials
- Firebase configuration with real project data

## Environment Variables Guide

### Client-Side Variables (Vite)
Variables prefixed with `VITE_` are exposed to the browser:

```bash
# These will be visible in the browser bundle
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
```

⚠️ **Note**: Firebase API keys are safe to expose publicly as they identify your Firebase project, not authenticate it. Authentication is handled by Firebase rules.

### Server-Side Variables
These remain server-only and are not exposed to the client:

```bash
# These stay on the server
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
PAYPAL_CLIENT_SECRET=...
```

## Best Practices

### 1. Use Different Environments
- Development: Use test/sandbox keys
- Production: Use live/production keys
- Never use production keys in development

### 2. Rotate Keys Regularly
- Change API keys periodically
- Revoke unused keys
- Monitor key usage in respective dashboards

### 3. Validate Environment Setup
- Check all required variables are set before starting
- Use the provided `.env.example` as a checklist
- Document any new environment variables

### 4. GitHub Repository Setup

Before pushing to GitHub:

1. ✅ Ensure `.env` is in `.gitignore`
2. ✅ Only commit `.env.example` with placeholder values
3. ✅ Remove any hardcoded secrets from code
4. ✅ Use environment variables in configuration files

## Required Environment Variables

### 🔴 Critical (App won't work without these)
- `DATABASE_URL` - PostgreSQL connection string
- `VITE_FIREBASE_*` - Firebase configuration (6 variables)

### 🟡 Important (Features won't work without these)
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` - For payments
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` - For PayPal payments

### 🟢 Optional (Nice to have)
- `EMAIL_SERVICE_API_KEY` - For sending emails
- `AWS_*` - For file storage (can use alternatives)

## Verification

After setup, verify your environment:

1. Copy `.env.example` to `.env`
2. Fill in your actual values
3. Check that `.env` is listed in `.gitignore`
4. Test that the app starts without errors
5. Confirm sensitive data is not in your Git history

## Recovery

If you accidentally committed secrets:

1. **Immediately** rotate/regenerate the exposed keys
2. Remove the secrets from Git history
3. Update your `.env` file with new keys
4. Add proper `.gitignore` rules

## Questions?

If you're unsure whether something should be an environment variable:
- If it's different between development/production → Environment variable
- If it's sensitive/secret → Environment variable  
- If it's a configuration that might change → Environment variable
