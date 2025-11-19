# CreativeHub - Creative Industry Platform

A modern, responsive web platform built with React, Vite, TailwindCSS, and React Router for showcasing creative work and connecting with the creative community.

## Features

- **Modern Tech Stack**: Built with React 18, TypeScript, Vite, and TailwindCSS
- **Responsive Design**: Fully responsive layout that works on all devices
- **Dark Mode**: Built-in dark mode support with persistent user preference
- **Routing**: Multi-page application with React Router
- **Beautiful UI**: Modern, clean interface with smooth transitions and animations
- **Component Library**: Reusable components following best practices

## Pages

- **Home**: Landing page with hero section and featured categories
- **Explore**: Browse and search creative projects by category
- **Projects**: View all projects with filtering and pagination

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 7** - Build tool and dev server
- **TailwindCSS v4** - Utility-first CSS framework (latest version)
- **React Router v7** - Client-side routing
- **PostCSS** - CSS processing with @tailwindcss/postcss

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
cd creative-hub
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
creative-hub/
├── src/
│   ├── components/     # Reusable components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── pages/         # Page components
│   │   ├── Home.tsx
│   │   ├── Explore.tsx
│   │   └── Projects.tsx
│   ├── App.tsx        # Main app component with routing
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles with Tailwind
├── public/            # Static assets
├── tailwind.config.js # Tailwind configuration
├── postcss.config.js  # PostCSS configuration
└── package.json       # Dependencies and scripts
```

## Customization

### Colors

Edit `tailwind.config.js` to customize the color palette:

```js
theme: {
  extend: {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      // Add your custom colors
    },
  },
}
```

### Components

All components use TailwindCSS utility classes. Custom component styles are defined in `src/index.css` using Tailwind's `@layer` directive.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.
