# ⚡ YouTube Analytics Dashboard - Next.js Edition

A **blazing-fast**, modern YouTube Analytics Dashboard built with **Next.js 14**, optimized for deployment on **Vercel**. Get comprehensive insights into your YouTube channel performance with real-time data visualization.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

### ⚡ Lightning Fast Performance
- **Edge Runtime** for sub-100ms API responses
- **Server-Side Rendering (SSR)** for instant page loads
- **Automatic Code Splitting** for optimal bundle sizes
- **Image Optimization** with Next.js Image component
- **SWR** for smart data fetching and caching

### 📊 Comprehensive Analytics
- **Channel Overview**: Subscribers, views, video count, and engagement metrics
- **Video Performance**: Views, likes, comments, and engagement rates
- **Interactive Charts**: Line charts, bar charts, and trend analysis
- **Top Videos**: Identify your best-performing content
- **Real-time Search**: Filter videos instantly
- **Sentiment Analysis**: Analyze comment sentiment

### 🎨 Modern UI/UX
- **Responsive Design**: Works on all devices
- **Dark Mode Support**: Automatic theme detection
- **Smooth Animations**: Framer Motion transitions
- **Beautiful Charts**: Recharts for data visualization
- **Tailwind CSS**: Utility-first styling

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data Fetching**: SWR
- **API**: YouTube Data API v3
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed
2. **YouTube Data API Key** ([Get one here](https://console.cloud.google.com/apis/credentials))
3. **Git** for version control
4. **Vercel Account** (free) for deployment

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd Youtube-Analytics-Dashboard
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
YOUTUBE_API_KEY=your_youtube_api_key_here
NEXT_PUBLIC_DEFAULT_CHANNEL=@PhysicsWallah
NODE_ENV=development
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deploy to Vercel

### Option 1: Deploy with Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. **Login to Vercel**:
   \`\`\`bash
   vercel login
   \`\`\`

3. **Deploy**:
   \`\`\`bash
   vercel
   \`\`\`

4. **Add Environment Variables** in Vercel Dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add \`YOUTUBE_API_KEY\`

### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Click "Add New Project"**

4. **Import your repository**

5. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: \`npm run build\`
   - Output Directory: \`.next\`

6. **Add Environment Variables**:
   - \`YOUTUBE_API_KEY\`: Your YouTube API key
   - \`NEXT_PUBLIC_DEFAULT_CHANNEL\`: Default channel name

7. **Click "Deploy"**

Your dashboard will be live in ~2 minutes! 🎉

## 🔧 Configuration

### YouTube API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **YouTube Data API v3**
4. Create credentials (API Key)
5. Copy the API key to your \`.env.local\`

### Customization

Edit the default channel in \`.env.local\`:
\`\`\`env
NEXT_PUBLIC_DEFAULT_CHANNEL=@YourChannelName
\`\`\`

## 📊 API Routes

The dashboard uses serverless API routes:

- \`/api/channel?name={channelName}\` - Get channel data and videos
- \`/api/video?id={videoId}\` - Get video details and comments

All routes use **Edge Runtime** for maximum performance.

## 🎯 Performance Optimizations

### 1. Caching Strategy
- API responses cached for 1 hour (3600s)
- Stale-while-revalidate for background updates
- Client-side caching with SWR

### 2. Image Optimization
- Next.js Image component with automatic optimization
- WebP format with fallbacks
- Lazy loading for off-screen images

### 3. Code Splitting
- Automatic route-based splitting
- Dynamic imports for heavy components
- Tree-shaking for minimal bundle size

### 4. Edge Runtime
- API routes run on Vercel Edge Network
- Global distribution for low latency
- Automatic scaling

## 📈 Features Comparison

| Feature | Old (Streamlit) | New (Next.js) |
|---------|----------------|---------------|
| Load Time | ~5-10s | <1s |
| Deployment | Railway/Render | Vercel |
| Caching | Limited | Advanced |
| Responsive | Partial | Full |
| SEO | Poor | Excellent |
| Performance Score | ~40 | ~95 |

## 🔍 Troubleshooting

### API Key Issues
- Ensure YouTube Data API v3 is enabled
- Check API key restrictions (HTTP referrers for production)
- Verify quota limits (10,000 units/day free)

### Build Errors
\`\`\`bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
\`\`\`

### Deployment Issues
- Check environment variables in Vercel dashboard
- Ensure \`YOUTUBE_API_KEY\` is set correctly
- Review build logs in Vercel dashboard

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- YouTube Data API v3
- Next.js team for the amazing framework
- Vercel for seamless deployment
- Recharts for beautiful visualizations

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions

## 🎓 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Built with ❤️ using Next.js 14 | Deployed on Vercel ⚡**
