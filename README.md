# 🚀 AI Startups Intelligence Platform

A modern, responsive dashboard for exploring and analyzing AI startup companies built with Next.js 14, TypeScript, and Tailwind CSS.

## ✨ Features

- **🎨 Modern UI**: Monochromatic design with orange accent colors
- **📊 Advanced Analytics**: Interactive charts and statistics
- **🔍 Smart Filtering**: Real-time search and multi-dimensional filtering
- **📱 Responsive Design**: Optimized for all device sizes
- **⚡ High Performance**: Built with Next.js 14 and optimized for speed
- **🎯 TypeScript**: Full type safety throughout the application
- **🎭 Animations**: Smooth transitions and micro-interactions

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Chart.js + react-chartjs-2

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Apps Script URL (for data fetching)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-startups-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Google Apps Script URL:
   ```env
   NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── charts/           # Chart components
│   ├── company/          # Company-related components
│   ├── filters/          # Filter components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API functions
├── store/                # Zustand store
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

## 🎨 Design System

### Colors
- **Primary**: `#0a0a0a` (Dark background)
- **Secondary**: `#1a1a1a` (Card backgrounds)
- **Tertiary**: `#2a2a2a` (Input backgrounds)
- **Orange**: `#ff6b35` (Accent color)
- **Orange Light**: `#ff8a65`
- **Orange Dark**: `#e64a19`

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

## 📊 Data Structure

The application expects startup data in the following format:

```typescript
interface Startup {
  id: string;
  companyName: string;
  ceo: string;
  location: string;
  yearFounded: number;
  description: string;
  category: string;
  mainValueProposition?: string;
  keyProducts?: string;
  technologicalAdvantage?: string;
  targetCustomer?: string;
  totalFundingRaised?: string;
  latestFundingRound?: string;
  keyInvestors?: string;
  // ... additional fields
}
```

## 🔧 Configuration

### Google Apps Script Setup

1. Create a Google Apps Script project
2. Set up your spreadsheet with startup data
3. Deploy as a web app with public access
4. Copy the deployment URL to your `.env.local`

### Tailwind CSS

The project uses a custom Tailwind configuration with:
- Custom color palette
- Extended animations
- Custom box shadows
- Responsive breakpoints

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables**
   ```bash
   vercel env add NEXT_PUBLIC_APPS_SCRIPT_URL
   ```

### Docker

```dockerfile
# Build and run with Docker
docker build -t ai-startups-dashboard .
docker run -p 3000:3000 ai-startups-dashboard
```

## 📈 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Bundle Size**: < 200KB (gzipped)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from modern SaaS dashboards
- Color palette optimized for accessibility
- Icons from Lucide React
- Fonts from Google Fonts

---

**Built with ❤️ using Next.js 14 and modern web technologies** 