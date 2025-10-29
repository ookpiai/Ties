# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Start the Development Server
```bash
cd creative-hub
npm run dev
```

The app will be available at `http://localhost:5173`

### 2. Build for Production
```bash
npm run build
```

### 3. Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
creative-hub/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.tsx      # Navigation bar with routing links
│   │   └── Footer.tsx      # Footer component
│   ├── pages/              # Page components
│   │   ├── Home.tsx        # Landing page with hero & categories
│   │   ├── Explore.tsx     # Browse projects by category
│   │   └── Projects.tsx    # All projects with filters
│   ├── App.tsx             # Main app with routing & dark mode
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles with Tailwind v4
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS with @tailwindcss/postcss
└── package.json            # Dependencies
```

## ✨ Key Features

### Dark Mode Toggle
- Floating button in bottom-right corner
- Persists user preference in localStorage
- Respects system preference by default

### Routing
- `/` - Home page
- `/explore` - Explore projects
- `/projects` - All projects

### TailwindCSS v4
- Uses the new `@import "tailwindcss"` syntax
- Custom components defined in `index.css`
- Utility classes available throughout

## 🎨 Customization

### Add a New Page
1. Create component in `src/pages/YourPage.tsx`
2. Import in `App.tsx`
3. Add route: `<Route path="/your-path" element={<YourPage />} />`
4. Add link in `Navbar.tsx`

### Modify Colors
Edit `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: '#YOUR_COLOR',
      secondary: '#YOUR_COLOR',
    },
  },
}
```

### Add Custom Components
In `src/index.css`:
```css
@layer components {
  .your-component {
    /* Your styles using theme() function */
  }
}
```

## 🛠️ Available Scripts

- `npm run dev` - Start dev server with hot reload
- `npm run build` - TypeScript check + production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 📦 Dependencies

### Core
- React 19.1.1
- React Router 7.9.3
- TypeScript 5.9.3

### Build Tools
- Vite 7.1.7
- TailwindCSS 4.1.14
- @tailwindcss/postcss

## 🔥 Next Steps

1. **Add Authentication** - Implement user login/signup
2. **Connect to API** - Fetch real project data
3. **Add More Pages** - Profile, Settings, Upload, etc.
4. **Enhance UI** - Add animations, transitions, loading states
5. **Deploy** - Deploy to Vercel, Netlify, or your preferred host

## 💡 Tips

- Use Tailwind utility classes directly in JSX
- Custom styles go in `index.css` using `@layer`
- Keep components small and reusable
- Use TypeScript for type safety
- Test dark mode with the toggle button

## 🐛 Troubleshooting

### CSS Lint Errors
The CSS linter may show errors for Tailwind v4's `theme()` function syntax. These are false positives - the build will work correctly.

### Port Already in Use
If port 5173 is busy, Vite will automatically use the next available port.

### Build Errors
Run `npm install` to ensure all dependencies are installed correctly.

---

**Happy coding! 🎉**
