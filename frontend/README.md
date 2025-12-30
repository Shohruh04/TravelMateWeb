# TravelMate Frontend

Modern, responsive frontend for the TravelMate AI-powered travel information platform.

## Tech Stack

- **React 18** - Modern UI library with hooks
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests

## Features

- Responsive design (mobile, tablet, desktop)
- AI-powered destination search
- Accommodation discovery
- Flight price estimates
- Tourist tools (currency converter, weather, etc.)
- Premium features and subscription management
- Type-safe API client
- Custom React hooks for API calls
- Modern, accessible UI components

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```env
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
```

### Development

Start the development server:

```bash
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
# or
bun run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
# or
bun run preview
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   └── layout/      # Layout components (Header, Footer)
│   ├── pages/           # Page components
│   │   ├── Home.tsx
│   │   ├── Accommodations.tsx
│   │   ├── Flights.tsx
│   │   ├── TouristTools.tsx
│   │   └── Premium.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useApi.ts    # API hooks
│   ├── utils/           # Utility functions
│   │   └── api.ts       # API client
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend uses a centralized API client (`src/utils/api.ts`) for all backend communication.

### Using the API Client

```typescript
import { api } from '@/utils/api'

// Search destinations
const results = await api.destinations.search('Paris')

// Get accommodations
const accommodations = await api.accommodations.search({
  location: 'Tokyo',
  checkIn: '2024-06-01',
  checkOut: '2024-06-07',
  guests: 2
})

// Search flights
const flights = await api.flights.search({
  from: 'JFK',
  to: 'LHR',
  departDate: '2024-06-01',
  passengers: 1
})
```

### Using Custom Hooks

```typescript
import { useApi, useMutation } from '@/hooks/useApi'
import { api } from '@/utils/api'

// Fetch data on component mount
const { data, loading, error } = useApi(
  () => api.destinations.getPopular(),
  { immediate: true }
)

// Manual API calls
const { execute } = useApi(() => api.destinations.search(query))
const handleSearch = () => execute()

// Mutations (POST, PUT, DELETE)
const { mutate, loading } = useMutation(
  (data) => api.user.updateProfile(data)
)
const handleUpdate = (formData) => mutate(formData)
```

## Styling

This project uses Tailwind CSS for styling with custom utility classes defined in `src/index.css`:

- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.btn-outline` - Outline button style
- `.input-field` - Form input style
- `.card` - Card component style
- `.section-container` - Section container with responsive padding

### Responsive Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## TypeScript

The project uses strict TypeScript configuration for better type safety. Type definitions are located in `src/types/index.ts`.

## Best Practices

1. **Component Organization**: Keep components small and focused
2. **Type Safety**: Use TypeScript interfaces for all data structures
3. **API Calls**: Use the centralized API client and custom hooks
4. **Responsive Design**: Mobile-first approach with Tailwind breakpoints
5. **Performance**: Lazy load routes and images when needed
6. **Accessibility**: Use semantic HTML and ARIA labels
7. **Code Style**: Follow existing patterns and conventions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Add state management (Redux/Zustand)
- [ ] Implement authentication flow
- [ ] Add offline support (PWA)
- [ ] Implement real-time updates (WebSocket)
- [ ] Add unit and integration tests
- [ ] Implement advanced filtering and sorting
- [ ] Add dark mode support
- [ ] Implement i18n for multiple languages

## Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Test your changes across different screen sizes
4. Update documentation as needed

## License

Copyright © 2024 TravelMate. All rights reserved.
