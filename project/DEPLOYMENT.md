# 🚀 Vercel Deployment Guide

## Prerequisites
- GitHub repository with your code
- Vercel account (free tier available)

## Step-by-Step Deployment

### 1. Prepare Your Repository
```bash
# Ensure all files are committed
git add .
git commit -m "Fix Vercel deployment issues"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd project
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? mutual-fund-explorer
# - Directory? ./
# - Override settings? N
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `project`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Click "Deploy"

### 3. Environment Variables (Optional)
In Vercel Dashboard → Project Settings → Environment Variables:
```
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.mfapi.in/mf
CACHE_TTL=86400
```

### 4. Domain Configuration
- Vercel provides a free `.vercel.app` domain
- You can add a custom domain in Project Settings → Domains

## Common Issues & Solutions

### Issue: Function Timeout
**Error**: `FUNCTION_INVOCATION_TIMEOUT`
**Solution**: 
- API routes are limited to 10s on free tier
- Consider upgrading to Pro for longer timeouts
- Optimize your API calls

### Issue: Build Failures
**Error**: `BUILD_FAILED`
**Solution**:
- Check Node.js version (use 18.x)
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors

### Issue: API Route Errors
**Error**: `FUNCTION_INVOCATION_FAILED`
**Solution**:
- Check API route syntax
- Ensure proper error handling
- Verify CORS headers

### Issue: Memory Issues
**Error**: `FUNCTION_PAYLOAD_TOO_LARGE`
**Solution**:
- Reduce response payload size
- Implement pagination
- Use streaming for large data

## Performance Optimization

### 1. Enable Caching
```javascript
// In your API routes
res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
```

### 2. Optimize Images
```javascript
// In next.config.js
images: {
  domains: ['images.pexels.com'],
  formats: ['image/webp', 'image/avif'],
}
```

### 3. Reduce Bundle Size
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer
```

## Monitoring & Debugging

### 1. Vercel Analytics
- Enable in Project Settings → Analytics
- Monitor performance and errors

### 2. Function Logs
- View in Vercel Dashboard → Functions
- Check for runtime errors

### 3. Build Logs
- Available in deployment details
- Check for build-time issues

## Troubleshooting Checklist

- [ ] All dependencies in `package.json`
- [ ] No TypeScript errors
- [ ] API routes have proper error handling
- [ ] CORS headers set correctly
- [ ] Environment variables configured
- [ ] Build command works locally
- [ ] No large payloads in API responses

## Support
- Vercel Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Status: https://vercel-status.com
