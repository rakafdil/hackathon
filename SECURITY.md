# 🔒 Security & Environment Setup Guide

## Important Security Notes

### 1. Environment Variables
- **NEVER** commit `.env` files to version control
- Always use `.env.example` as a template
- Generate strong secrets for production

### 2. Generate Strong JWT Secret

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Using OpenSSL:**
```bash
openssl rand -hex 64
```

**Using PowerShell:**
```powershell
-join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Minimum 0 -Maximum 16) })
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

### 4. CORS Configuration

Update `ALLOWED_ORIGINS` with your actual frontend URLs:
```env
ALLOWED_ORIGINS=http://localhost:3003,https://your-production-domain.com
```

### 5. Production Checklist

Before deploying to production:
- [ ] Change `JWT_SECRET` to a strong, randomly generated secret
- [ ] Update `ALLOWED_ORIGINS` to your production domain only
- [ ] Set up Google OAuth with production redirect URI
- [ ] Use environment-specific `.env` files
- [ ] Enable HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Use a production database (not localhost PostgreSQL)
- [ ] Review and update all default passwords

## Quick Start

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 3. Update .env with your values

# 4. Start development
pnpm install
docker-compose up -d
pnpm dev
```
