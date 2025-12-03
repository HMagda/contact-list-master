# Contact List

A React TypeScript application for browsing and managing contacts with full accessibility support.

## Features

### Contact Management
- **Paginated Loading**: Fetches contacts in batches of 10 with a "Load More" button
- **Selection Management**: Click or use keyboard (Enter/Space) to select/deselect contacts
- **Smart Sorting**: Selected contacts automatically appear at the top, ordered by selection time (most recently selected first)
- **Selection Counter**: Live display of how many contacts are currently selected

### Loading & Error States
- **Loading Spinner**: Animated spinner displays while fetching data from the API
- **Error Handling with Retry**: The API has a 10% simulated failure rate to demonstrate error handling. When an error occurs:
  - An error message is displayed to the user
  - A **Retry** button appears allowing users to attempt the request again
  - This showcases a common UX pattern for handling network failures gracefully

### Performance Optimizations
- `React.memo` for preventing unnecessary re-renders
- `useCallback` and `useMemo` hooks for memoization
- `Set` data structure for O(1) selection lookups

## Accessibility (WCAG/ADA Compliant)

- Skip link for keyboard navigation
- Full keyboard support (Tab, Enter, Space)
- ARIA labels and roles (listbox, option, status, alert)
- Screen reader announcements for selection changes
- Focus indicators (3px outline)
- High contrast mode support
- Reduced motion support

## Tech Stack

- React 19
- TypeScript 5.9
- CSS Custom Properties
- Jest + React Testing Library

## Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) v18 or higher
- npm v8.3 or higher (comes with Node.js 18+)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd contact-list-master
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

The app will automatically reload when you make changes to the source files.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run development server on port 3000 |
| `npm test` | Run tests in watch mode |
| `npm test -- --watchAll=false` | Run tests once (CI mode) |
| `npm run build` | Build for production in `build/` folder |

## Project Structure

```
src/
├── App.tsx          # Main component with state management
├── App.css          # Styles with CSS custom properties
├── App.test.tsx     # Unit tests
├── PersonInfo.tsx   # Contact card component
├── api.ts           # Mock API with 1s delay and 10% failure rate
├── mockData.json    # Sample contact data
├── index.tsx        # Entry point
└── index.css        # Global styles
```

## Error Feature Demo

The application intentionally includes a simulated 10% API failure rate (`src/api.ts`) to demonstrate proper error handling UX:

1. Click "Load More" to fetch additional contacts
2. If the request fails, you'll see an error message: "Something went wrong"
3. Click the **Retry** button to attempt the request again
4. The retry uses the same fetch logic, allowing users to recover from transient failures

This pattern is useful for real-world applications where network requests may occasionally fail.
