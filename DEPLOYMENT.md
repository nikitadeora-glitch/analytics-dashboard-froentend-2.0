# Deployment Guide for SPA Routing Fix

## Problem
When refreshing the page on production, it shows "Page Not Found" error because the server tries to find the exact file path instead of letting React Router handle the routing.

## Solutions

### 1. Apache Server (.htaccess)
The `.htaccess` file has been created in the `public/` folder. When you build the app, it will be copied to the `dist/` folder automatically.

**Key features:**
- Redirects all non-file/non-directory requests to `index.html`
- Enables gzip compression
- Sets proper caching headers for static assets
- Handles trailing slashes properly

### 2. Nginx Server
Use the provided `nginx.conf` file and update these values:
- `server_name`: Your actual domain
- `root`: Path to your `dist` folder

**Configuration:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 3. Node.js/Express Server
If using Node.js, add this middleware before your static files:
```javascript
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

### 4. Vercel/Netlify
These platforms handle SPA routing automatically, but you can add a `vercel.json` or `netlify.toml` if needed:

**vercel.json:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**netlify.toml:**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Build and Deploy

1. **Build the app:**
```bash
npm run build
```

2. **Deploy the `dist/` folder** to your server with the appropriate configuration.

3. **Test the deployment:**
- Navigate to any route (e.g., `/dashboard/project/123`)
- Refresh the page
- It should load correctly without showing "Page Not Found"

## Verification
After deployment, test these scenarios:
- Direct navigation to any route
- Page refresh on any route
- Browser back/forward navigation
- Bookmarking and sharing URLs

## Troubleshooting
If the issue persists:
1. Check that the `.htaccess` file is in the correct location on the server
2. Verify Apache `mod_rewrite` is enabled
3. For nginx, ensure the configuration is reloaded
4. Check browser console for any JavaScript errors
5. Verify the build includes the `.htaccess` file in the `dist/` folder
