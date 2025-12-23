# Siino Management - Web Application

A Next.js web application that connects to your existing Siino Management Supabase backend, providing a full-featured business management dashboard alongside your iOS app.

## 🚀 Features

- **Dashboard Overview** - Quick stats and recent activity
- **Projects** - Full CRUD with status, type, and client management
- **Clients** - Contact management with portal access codes
- **Invoices** - Create invoices with line items and Quebec tax support (TPS/TVQ)
- **Expenses** - Track business expenses (coming soon)
- **Tasks** - Task management with priorities (coming soon)
- **Bookings** - Appointment scheduling (coming soon)
- **Settings** - Team and billing configuration

## 📋 Prerequisites

- Node.js 18+ installed
- Your existing Supabase project (from the iOS app)
- Git installed

## 🛠️ Local Development Setup

### 1. Clone/Copy the Project

```bash
# If you have the zip file, extract it
# Or if in a repo, clone it
cd siino-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
# From your Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://zutvjmdebkupfowryese.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Where to find these values:**
1. Go to [supabase.com](https://supabase.com) and open your project
2. Click **Project Settings** (gear icon)
3. Click **API** in the sidebar
4. Copy the **Project URL** and **anon/public** key

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deploying to Vercel

Vercel is the easiest way to deploy Next.js applications. Here's how:

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/siino-web.git
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign up/login with GitHub

3. **Click "Add New Project"**

4. **Import your repository** from GitHub

5. **Configure Environment Variables**
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

6. **Click "Deploy"**

Your app will be live at `https://your-project.vercel.app` within minutes!

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

## 🔗 Connecting to Your Existing Supabase Backend

Your iOS app and web app will share the same Supabase backend. Here's what that means:

### Shared Data
- All clients, projects, invoices, etc. are synced
- Create a project on iOS → see it instantly on web
- Changes on web → reflected in iOS app

### Authentication
- Users can sign in with the same credentials on both platforms
- Each platform maintains its own session

### Real-time Sync
The web app uses Supabase's real-time subscriptions (just like your iOS app) to keep data synchronized across all devices.

## 📁 Project Structure

```
siino-web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Protected dashboard pages
│   │   │   ├── projects/
│   │   │   ├── clients/
│   │   │   ├── invoices/
│   │   │   └── ...
│   │   ├── login/
│   │   ├── signup/
│   │   └── setup/              # Team creation flow
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   └── layout/             # Layout components (Sidebar, etc.)
│   ├── lib/
│   │   ├── supabase/           # Supabase client configuration
│   │   ├── store.ts            # Zustand state management
│   │   └── utils.ts            # Utility functions
│   └── types/                  # TypeScript type definitions
├── middleware.ts               # Auth middleware
├── tailwind.config.ts          # Tailwind configuration
└── package.json
```

## 🎨 Customization

### Theme Colors

The app uses your iOS app's design system. To customize colors, edit `tailwind.config.ts`:

```typescript
colors: {
  accent: {
    DEFAULT: '#9B7EBF',  // Your purple accent
    dark: '#7C5DAF',
    // ...
  },
  // ...
}
```

### Adding New Features

1. **Create a new page**: Add a folder in `src/app/dashboard/`
2. **Add to navigation**: Edit `src/components/layout/Sidebar.tsx`
3. **Add types**: Update `src/types/index.ts`
4. **Add state**: Update `src/lib/store.ts`

## 🔒 Security Notes

- Never commit `.env.local` to version control
- The `anon` key is safe to expose (RLS protects your data)
- Never expose your `service_role` key in client-side code

## 📱 iOS App Integration

Your web app and iOS app share:

| Feature | Shared? | Notes |
|---------|---------|-------|
| Database | ✅ | Same Supabase tables |
| Auth | ✅ | Same user accounts |
| Real-time | ✅ | Both subscribe to changes |
| RLS Policies | ✅ | Same security rules |
| File Storage | ✅ | Same Google Drive integration |

## 🐛 Troubleshooting

### "Invalid API Key" Error
- Check that your `.env.local` file has the correct Supabase URL and key
- Make sure there are no extra spaces or quotes

### Auth Not Working
- Ensure your Supabase project has Email auth enabled
- Check Site URL in Supabase Auth settings matches your deployment URL

### Data Not Loading
- Verify your Supabase tables exist (they should from iOS app usage)
- Check browser console for RLS policy errors

### Vercel Deployment Issues
- Ensure all environment variables are set in Vercel dashboard
- Check build logs for TypeScript errors

## 📄 License

Private - Siino Media

---

## Quick Reference

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Lint
npm run lint

# Deploy to Vercel
vercel --prod
```

## Support

For issues or questions, contact the development team or open an issue in the repository.
