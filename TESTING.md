# Testing Documentation

This project uses **Vitest** for unit testing with React Testing Library.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized alongside the code they test:

```
src/
├── components/
│   └── ui/
│       ├── __tests__/
│       │   ├── AutocompleteInput.test.tsx
│       │   ├── SearchPill.test.tsx
│       │   └── TheatreCreateModal.test.tsx
│       ├── AutocompleteInput.tsx
│       ├── SearchPill.tsx
│       └── TheatreCreateModal.tsx
├── hooks/
│   ├── __tests__/
│   │   └── useQueries.test.tsx
│   └── useQueries.ts
├── firebase/
│   ├── __tests__/
│   │   └── firestore.test.ts
│   └── firestore.ts
├── __tests__/
│   └── dataOperations.test.ts
└── test/
    ├── setup.ts          # Test configuration and global mocks
    ├── utils.tsx         # Custom render function with providers
    └── mockData.ts       # Mock data for testing
```

## Test Coverage

The test suite covers:

### Components
- **SearchPill**: Navigation, encoding, styling
- **AutocompleteInput**: Filtering, selection, pill display, paste handling, creation
- **TheatreCreateModal**: Form validation, submission, modal behavior

### Hooks
- **useRecordings**: Data fetching, loading states, error handling
- **usePeople**: Data fetching
- **useTheatres**: Data fetching

### Firebase
- **Firestore helpers**: CRUD operations, error handling

### Data Operations
- **Search/Filter**: Title, theatre, artist, city searches
- **Sorting**: Date and alphabetical sorting
- **Validation**: Required fields, data types
- **Array operations**: Limiting, deduplication, filtering

## Writing New Tests

### Component Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useMyHook', () => {
  it('fetches data', async () => {
    const { result } = renderHook(() => useMyHook(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

## Mocking

### Firebase
Firebase is automatically mocked in `src/test/setup.ts`. No additional setup needed.

### Next.js Router
Next.js navigation hooks are mocked globally in `src/test/setup.ts`.

### Custom Mocks
For component-specific mocks:

```typescript
vi.mock('@/path/to/module', () => ({
  myFunction: vi.fn(),
}));
```

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Test behavior, not implementation**: Focus on what users see/do
3. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
4. **Clean up**: Tests automatically clean up after each run
5. **Mock external dependencies**: Keep tests isolated and fast
6. **Test edge cases**: Empty states, errors, loading states

## Continuous Integration

Tests should be run in CI/CD pipelines before deployment:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test
  
- name: Generate coverage
  run: npm run test:coverage
```

## Troubleshooting

### Tests timing out
Increase timeout in `vitest.config.ts`:
```typescript
test: {
  testTimeout: 10000,
}
```

### Module not found
Check path aliases in `vitest.config.ts` match `tsconfig.json`.

### Mock not working
Ensure mocks are defined before imports using `vi.mock()` at the top level.
