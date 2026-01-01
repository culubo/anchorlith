# AnchorLith

A minimalist, text-forward productivity web app inspired by Notion/Obsidian/OpenAI UI.

## Features

- **Today Page**: View your schedule and tasks for today
- **Notes**: Markdown-enabled notes with split view editor
- **Todos**: Task management with filters and inline creation
- **Calendar**: Event management with list view
- **Reminders**: Time-based reminders
- **Public Pages**: Shareable resume, portfolio, and links pages
- **Settings**: Theme customization and data export

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for subtle animations
- **Supabase** for database, auth, and storage

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Database Migrations

1. In your Supabase dashboard, go to SQL Editor
2. Run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`

### 4. Set Up Storage

1. In Supabase dashboard, go to Storage
2. Create a new bucket named `files`
3. Set it to public (or configure RLS policies as needed)

### 5. Configure Authentication

1. In Supabase dashboard, go to Authentication > URL Configuration
2. Add your site URL to allowed redirect URLs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (main)/          # Main app pages (protected)
│   ├── p/               # Public pages
│   └── api/             # API routes
├── components/          # React components
├── lib/                 # Utilities and helpers
└── supabase/            # Database migrations
```

## Design Philosophy

- **Typography-first**: Minimal UI driven by text hierarchy and spacing
- **No heavy containers**: Avoid cards and borders; use spacing and indentation
- **Subtle motion**: Light animations for transitions and interactions
- **Private by default**: All data is private unless explicitly shared

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key

## License

MIT
