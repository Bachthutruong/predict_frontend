# Frontend Deployment Guide

## 🚀 Quick Fix for Routing Issues

### Files Added/Modified:
1. **`vercel.json`** - SPA routing configuration for Vercel
2. **`public/_redirects`** - Fallback routing for Netlify/other platforms
3. **`vite.config.ts`** - Updated with path aliases and build optimization
4. **`tsconfig.app.json`** - Added path aliases support
5. **`package.json`** - Added @types/node for path support

### Environment Variables:
Make sure to set on your deployment platform:
```
VITE_API_URL=https://predict-backend-63un.onrender.com/api
```

### Build Commands:
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview build locally
npm run preview
```

### Deploy to Vercel:
```bash
# Using Vercel CLI
vercel --prod

# Or connect your GitHub repo to Vercel dashboard
```

### Deploy to Netlify:
```bash
# Build command: npm run build
# Publish directory: dist
```

## 🔧 What was fixed:

1. **Routing Issues**: Added `vercel.json` to handle SPA routing
2. **Path Aliases**: Configured `@` alias for cleaner imports
3. **Build Optimization**: Added chunk splitting for better performance
4. **TypeScript Support**: Added proper path resolution

## 📝 Notes:

- All routes now fallback to `index.html` for client-side routing
- Path aliases `@/*` now work properly
- Build is optimized with vendor/router chunks
- Compatible with both Vercel and Netlify 