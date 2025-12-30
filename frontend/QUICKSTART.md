# TravelMate Frontend - Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env` file is already created. Update if needed:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:5173`

## Project Overview

### Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Landing page with search and features |
| `/accommodations` | Accommodations | Search and browse hotels/rentals |
| `/flights` | Flights | Flight search and price estimates |
| `/tourist-tools` | TouristTools | Currency converter, weather, etc. |
| `/premium` | Premium | Pricing plans and subscription |

### Key Files

```
src/
├── App.tsx                      # Main app with routing
├── main.tsx                     # Entry point
├── components/layout/           # Header, Footer, Layout
├── pages/                       # Page components
├── utils/api.ts                 # API client (Axios)
├── hooks/useApi.ts              # Custom API hooks
└── types/index.ts               # TypeScript definitions
```

### API Client Usage

```typescript
import { api } from '@/utils/api'

// Search destinations
const results = await api.destinations.search('Paris')

// Get accommodations
const places = await api.accommodations.search({
  location: 'Tokyo',
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

### Custom Hooks

```typescript
import { useApi } from '@/hooks/useApi'
import { api } from '@/utils/api'

// Auto-fetch on mount
const { data, loading, error } = useApi(
  () => api.destinations.getPopular(),
  { immediate: true }
)

// Manual execution
const { execute, loading } = useApi(() => api.destinations.search(query))
const handleSearch = () => execute()
```

## Development Workflow

### 1. Add a New Page

```typescript
// src/pages/NewPage.tsx
const NewPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="section-container">
        <h1 className="text-4xl font-bold">New Page</h1>
      </section>
    </div>
  )
}

export default NewPage
```

```typescript
// Add to App.tsx
<Route path="/new-page" element={<NewPage />} />
```

### 2. Add API Endpoint

```typescript
// In src/utils/api.ts
export const api = {
  // ... existing endpoints
  newFeature: {
    getData: (id: string) =>
      request<DataType>('get', `/new-feature/${id}`),

    create: (data: CreateData) =>
      request<DataType>('post', '/new-feature', data),
  },
}
```

### 3. Add Types

```typescript
// In src/types/index.ts
export interface NewDataType {
  id: string
  name: string
  // ... other fields
}
```

## Styling

### Using Tailwind Classes

```tsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">Title</h2>
  <p className="text-gray-600">Description</p>
</div>
```

### Custom Button Classes

```tsx
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="btn-outline">Outlined</button>
```

### Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>
```

## Common Tasks

### Fetch Data on Mount

```typescript
const { data, loading, error } = useApi(
  () => api.destinations.getPopular(),
  { immediate: true }
)

if (loading) return <div>Loading...</div>
if (error) return <div>Error: {error.message}</div>
return <div>{/* Render data */}</div>
```

### Form Submission

```typescript
const { mutate, loading } = useMutation(
  (formData) => api.accommodations.search(formData)
)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  const result = await mutate(formData)
  if (result) {
    // Handle success
  }
}
```

### Navigation

```typescript
import { Link, useNavigate } from 'react-router-dom'

// Using Link component
<Link to="/flights" className="btn-primary">View Flights</Link>

// Using navigate hook
const navigate = useNavigate()
const handleClick = () => navigate('/accommodations')
```

## Build & Deploy

### Production Build

```bash
npm run build
```

Output: `dist/` directory

### Preview Build

```bash
npm run preview
```

### Deploy

The `dist/` folder can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## Troubleshooting

### Port Already in Use

```bash
# Change port in vite.config.ts or:
npm run dev -- --port 5174
```

### API Connection Issues

1. Check `.env` has correct `VITE_API_URL`
2. Ensure backend is running
3. Check browser console for CORS errors

### TypeScript Errors

```bash
# Check for errors
npm run build

# Common fixes:
# - Add missing types in src/types/index.ts
# - Import types from '@/types'
# - Use 'unknown' instead of 'any'
```

### Build Failures

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## Next Steps

1. Connect to real backend API
2. Implement authentication flow
3. Add user profile management
4. Implement real-time features
5. Add unit tests
6. Optimize images and assets
7. Add PWA support
8. Implement i18n for multiple languages

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com)

## Support

For issues or questions:
1. Check the README.md
2. Review the code comments
3. Check the TypeScript types
4. Review the API client structure

Happy coding! 🚀
