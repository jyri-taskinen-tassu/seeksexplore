# Seeks & Explore - Landing Page

Landing page for Seeks & Explore, an infrastructure platform for experience and activity providers.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## Deployment

This project is configured for deployment on Vercel.

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and deploy

### Important Notes

- **SEO is currently disabled** (robots.txt blocks all crawlers, noindex meta tags)
- Only the landing page (`/`) is intended for public access
- Provider routes (`/provider/*`) are part of the MVP but not publicly indexed

## Project Structure

- `app/page.tsx` - Landing page (public)
- `app/provider/*` - Provider MVP pages (not indexed)
- `app/globals.css` - Global styles with brand colors
