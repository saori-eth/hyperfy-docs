# Hyperfy Docs Site

A lightweight, auto-updating documentation site for Hyperfy that fetches markdown directly from the GitHub repository.

## Features

- ✨ Automatically fetches and displays markdown from GitHub
- 🚀 Static site generation for fast performance
- 🎨 Clean, responsive design with Tailwind CSS
- 🔍 Syntax highlighting for code blocks
- 📱 Mobile-friendly sidebar navigation
- ♻️ Auto-rebuilds on Vercel when docs update

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **GitHub API** - Fetching markdown content
- **Vercel** - Hosting and deployment

## Deployment

### Deploy to Vercel

1. Push this code to a GitHub repository
2. Connect the repo to Vercel
3. Vercel will auto-detect Next.js and deploy (no special settings needed)

### Environment Variables (Optional)

To increase GitHub API rate limits (60 → 5000 requests/hour):

1. Create a GitHub Personal Access Token at https://github.com/settings/tokens
2. Add to Vercel: `GITHUB_TOKEN=your_token_here`

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## How It Works

1. **Build Time**: Fetches all markdown files from `hyperfy-xyz/hyperfy` repo's `docs` folder
2. **Static Generation**: Creates static HTML pages for each document
3. **Navigation**: Automatically generates sidebar from folder structure
4. **Updates**: Rebuilds automatically on Vercel when triggered

## Writing Documentation

### Internal Linking

The site automatically processes markdown links. Recommended formats:

```markdown
# Relative links (best for nearby files)
[Sibling file](./commands.md)
[Child folder](./scripting/README.md)
[Parent level](../README.md)

# Absolute from docs root (best for cross-sections)
[Commands](/docs/commands.md)
[Scripting Guide](/docs/scripting/README.md)

# Also works without .md extension
[Audio Node](./nodes/types/Audio)
```

All internal links are automatically converted to proper routes:
- `/docs/` prefix is removed
- `.md` extensions are stripped
- Relative paths are resolved correctly

## Auto-Update Setup

To enable automatic updates when docs change:

1. In your Vercel project settings, go to Git Integration
2. Enable automatic deployments for the main branch
3. (Optional) Set up a webhook in the Hyperfy repo to trigger rebuilds

## File Structure

```
/
├── app/              # Next.js app directory
│   ├── layout.tsx    # Main layout with sidebar
│   ├── page.tsx      # Home page
│   └── [[...slug]]/  # Dynamic routing for docs
├── components/       # React components
│   ├── Sidebar.tsx   # Navigation sidebar
│   └── MarkdownContent.tsx
├── lib/              # Utilities
│   ├── github.ts     # GitHub API fetching
│   └── markdown.ts   # Markdown processing
└── public/           # Static assets
```

## License

MIT