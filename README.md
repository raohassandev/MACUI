# Dynamic Theme App

A React application with Vite and Tailwind CSS that allows users to create, customize, and switch between different themes.

## Features

- Theme switching
- Custom theme creation with color pickers
- Preview of theme changes
- Persistent themes across sessions (using localStorage)
- Responsive design

## Project Structure

```
theme-app/
├── src/
│   ├── components/
│   │   ├── ThemeBuilder/
│   │   │   ├── ColorPicker.tsx
│   │   │   └── ThemeBuilder.tsx
│   │   └── ThemeSelector.tsx
│   ├── features/
│   │   └── theme/
│   │       └── themeSlice.ts
│   ├── hooks/
│   │   ├── useAppDispatch.ts
│   │   ├── useAppSelector.ts
│   │   └── index.ts
│   ├── themes/
│   │   └── (space for predefined themes)
│   ├── App.tsx
│   ├── main.tsx
│   ├── store.ts
│   └── index.css
├── public/
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

## How It Works

The application uses CSS variables and Tailwind CSS to dynamically apply themes. The theme system works as follows:

1. Themes are stored as objects with color properties
2. When a theme is selected, CSS variables are updated in the document root
3. Tailwind CSS is configured to use these CSS variables
4. Components use Tailwind classes that reference these variables

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Creating Custom Themes

1. Go to the Theme Builder section
2. Enter a name for your theme
3. Customize colors using the color pickers
4. Click "Create Theme"
5. Your new theme will appear in the Theme Selector

## Technical Details

- Built with React and TypeScript
- Uses Vite for fast development and building
- Styled with Tailwind CSS
- Theme state is managed through Redux Toolkit
- Follows redux best practices with slices, typed hooks, and selector functions
- Themes persist using localStorage