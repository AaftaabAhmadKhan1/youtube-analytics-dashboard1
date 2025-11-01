# 🚀 Vercel Deployment Guide

## Step-by-Step Deployment Instructions

### Method 1: One-Click Deploy (Fastest)

1. **Push your code to GitHub**:
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit - Next.js YouTube Analytics"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   \`\`\`

2. **Deploy to Vercel**:
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**:
   - In the deployment screen, expand "Environment Variables"
   - Add:
     - Key: \`YOUTUBE_API_KEY\`
     - Value: Your YouTube API key
   - Click "Deploy"

4. **Done!** Your site will be live at \`https://your-project.vercel.app\`

### Method 2: Vercel CLI (For Developers)

1. **Install Vercel CLI**:
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. **Login**:
   \`\`\`bash
   vercel login
   \`\`\`

3. **Deploy**:
   \`\`\`bash
   vercel
   \`\`\`
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? Enter a name
   - In which directory is your code located? **.**
   - Want to override settings? **N**

4. **Add Environment Variables**:
   \`\`\`bash
   vercel env add YOUTUBE_API_KEY
   \`\`\`
   Paste your API key when prompted.

5. **Deploy to Production**:
   \`\`\`bash
   vercel --prod
   \`\`\`

## Environment Variables Setup

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| \`YOUTUBE_API_KEY\` | Your YouTube Data API v3 key | \`AIzaSy...\` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| \`NEXT_PUBLIC_DEFAULT_CHANNEL\` | Default channel to load | \`@PhysicsWallah\` |

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

1. Go to your project dashboard on Vercel
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### 2. API Rate Limiting

YouTube API has a quota of **10,000 units/day** (free tier).

To optimize:
- Enable caching (already configured)
- Monitor usage in [Google Cloud Console](https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas)
- Consider implementing request throttling for high traffic

### 3. Analytics Setup

Add Vercel Analytics (optional):
\`\`\`bash
npm i @vercel/analytics
\`\`\`

Then add to \`app/layout.tsx\`:
\`\`\`tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
\`\`\`

## Performance Optimization

### Edge Runtime
All API routes use Edge Runtime by default:
\`\`\`typescript
export const runtime = 'edge';
\`\`\`

### Caching Headers
API responses include optimal cache headers:
\`\`\`typescript
{
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
}
\`\`\`

### Image Optimization
Images are automatically optimized by Next.js:
- WebP format with fallbacks
- Responsive sizing
- Lazy loading

## Monitoring & Debugging

### View Logs
\`\`\`bash
vercel logs <deployment-url>
\`\`\`

### Check Build Status
Visit your project dashboard → "Deployments"

### Performance Monitoring
- Use Vercel Analytics for real-time insights
- Check [Lighthouse](https://pagespeed.web.dev/) scores
- Monitor [Web Vitals](https://web.dev/vitals/)

## Common Issues & Solutions

### Issue: API Key Not Working

**Solution**:
1. Verify the API key in Google Cloud Console
2. Ensure YouTube Data API v3 is enabled
3. Check API key restrictions
4. Re-deploy after updating environment variables

### Issue: Quota Exceeded

**Solution**:
1. Check quota usage in Google Cloud Console
2. Implement rate limiting
3. Increase cache duration
4. Request quota increase (if needed)

### Issue: Build Fails

**Solution**:
\`\`\`bash
# Locally test the build
npm run build

# Check for TypeScript errors
npm run lint

# Clear cache
rm -rf .next node_modules
npm install
\`\`\`

## Scaling Considerations

### Free Tier Limits (Vercel)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless function execution
- ✅ Edge Network (CDN)

### Pro Tips for High Traffic
1. **Use Vercel KV for caching** (reduces API calls)
2. **Implement rate limiting** at application level
api.enter_log=v1.sem(set_fun)
set_attr.log(u1,u2)
3. **Use ISR** (Incremental Static Regeneration) for popular channels
run_rate.(attr)=s2.visual(set)
4. **Consider upgrading** to YouTube API paid tier

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Restrict API key** to your domain in production
4. **Enable HTTPS** (automatic with Vercel)
5. **Review Vercel security headers**

## Continuous Deployment

After initial setup, every push to \`main\` branch will:
1. ✅ Automatically trigger a new build
2. ✅ Run build checks
3. ✅ Deploy to production
4. ✅ Generate preview URLs for branches

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **YouTube API Docs**: https://developers.google.com/youtube/v3
- **Community Support**: Vercel Discord, GitHub Issues

---

**Ready to deploy?** Just run \`vercel\` in your terminal! 🚀
