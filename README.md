# Chidc's GitHub Portfolio

A professional multi-page portfolio website built with React, TypeScript, and Vite, showcasing GitHub projects and repositories in real-time.

**Live Demo**: [chidc.pages.dev](https://chidc.pages.dev)

## Features

- **Real-time GitHub Data**: All content (repositories, READMEs, stats) is fetched live from the GitHub API - no hardcoded data
- **Multi-page Architecture**: Home, Repositories, and individual Project pages with React Router
- **Full Markdown Rendering**: Custom Markdown renderer supporting all common formats (headings, tables, code blocks, images, lists, etc.)
- **Responsive Design**: Built with Tailwind CSS and shadcn/ui components
- **Dark/Light Theme**: Automatic theme detection and switching

## Tech Stack

- **React 19** + **TypeScript** + **Vite 7**
- **React Router 7** for client-side routing
- **Tailwind CSS 3** for styling
- **shadcn/ui** for UI components
- **GitHub REST API** for real-time data fetching

## Project Structure

```
src/
  pages/
    HomePage.tsx          # Landing page with bio, stats, featured projects
    RepositoriesPage.tsx  # All repos with search, sort, and filtering
    ProjectPage.tsx       # Dynamic project detail page (/p/:name)
  components/
    MarkdownRenderer.tsx  # Full Markdown parser and renderer
    TopNavbar.tsx         # Top navigation bar
    Sidebar.tsx           # Side navigation
  lib/
    github-api.ts         # GitHub API integration layer
  App.tsx                 # Router configuration
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with GitHub bio, stats, and featured projects |
| `/repos` | All repositories with search, sort, and language filtering |
| `/p/:name` | Individual project detail page with full README rendering |

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to Workers & Pages > Create Application
3. Connect your GitHub repository
4. Configure:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Deploy

### GitHub Pages

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automatic deployment:

1. Go to your repository Settings > Pages
2. Set source to GitHub Actions
3. Push to `main` branch to trigger deployment

## Configuration

Edit `src/lib/github-api.ts` to change the GitHub username:

```typescript
const GITHUB_USER = "ChidcGithub";
```

## License

MIT
