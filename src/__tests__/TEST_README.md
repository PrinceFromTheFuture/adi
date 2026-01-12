# Testing Documentation

This directory contains comprehensive tests for the health/fitness tracking application.

## Test Structure

```
__tests__/
├── api/                    # API and database operation tests
│   ├── db-operations.test.ts
│   └── entity-routes.test.ts
├── components/            # UI component tests
│   ├── dashboard/
│   └── meals/
├── integration/           # Feature integration tests
│   ├── meal-tracking.test.tsx
│   ├── workout-tracking.test.tsx
│   ├── user-profile.test.tsx
│   └── water-steps-tracking.test.tsx
├── e2e/                   # End-to-end workflow tests
│   └── user-workflows.test.tsx
└── utils/                 # Utility function tests
    └── calculations.test.ts
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test suites
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# End-to-end tests only
npm run test:e2e
```

### Run specific test file
```bash
npm test -- meal-tracking.test
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="User creates a meal"
```

## Test Categories

### 1. API Tests (`api/`)
Tests database operations and API routes:
- CRUD operations for all entities
- Field mapping (snake_case ↔ camelCase)
- Filter operations with operators ($gt, $gte, $lt, $lte, $in)
- Error handling
- Validation

**Coverage:**
- ✅ listEntity
- ✅ filterEntity
- ✅ createEntity
- ✅ bulkCreateEntity
- ✅ updateEntity
- ✅ deleteEntity
- ✅ GET, POST, PUT, DELETE API routes

### 2. Component Tests (`components/`)
Tests React components and user interactions:
- Component rendering
- Form submissions
- Button clicks
- User input handling
- Props validation

**Coverage:**
- ✅ WelcomeCard
- ✅ MealForm
- More components can be added

### 3. Integration Tests (`integration/`)
Tests complete feature workflows:
- **Meal Tracking:** Creating, viewing, updating, deleting meals
- **Workout Tracking:** Workout templates, sessions, active workouts
- **User Profile:** Authentication, profile updates, weight logging
- **Water & Steps:** Daily tracking, goal progress

**Coverage:**
- ✅ 40+ integration test scenarios
- ✅ All major features covered
- ✅ Data flow from frontend to API

### 4. End-to-End Tests (`e2e/`)
Tests complete user journeys:
- **Daily Tracking Workflow:** Complete day of health tracking
- **Weekly Meal Planning:** Creating and using meal templates
- **Progress Tracking:** Weight loss monitoring over time
- **Workout Programs:** Creating programs and tracking sessions
- **Food Database Management:** Custom foods and usage
- **Reminders & Scheduling:** Setting up notifications and rest days

**Coverage:**
- ✅ 6 complete user workflows
- ✅ Multi-step processes
- ✅ Data persistence validation

### 5. Utility Tests (`utils/`)
Tests calculation and helper functions:
- BMI calculations
- Calorie and macro calculations (BMR, TDEE)
- Progress calculations
- Water intake recommendations
- Steps to distance/calories conversion
- Date calculations

**Coverage:**
- ✅ 20+ utility function tests
- ✅ Health calculation formulas
- ✅ Progress tracking math

## Test Statistics

### Total Tests: 120+
- API Tests: 25+
- Component Tests: 10+
- Integration Tests: 40+
- E2E Tests: 30+
- Utility Tests: 20+

### Coverage Goals
- Statements: 70%+
- Branches: 70%+
- Functions: 70%+
- Lines: 70%+

## Testing Best Practices

### 1. Test Naming
```typescript
describe('Feature Name', () => {
  describe('Sub-feature or scenario', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

### 2. Arrange-Act-Assert Pattern
```typescript
it('should create a meal', async () => {
  // Arrange
  const mealData = { ... };
  
  // Act
  const result = await createMeal(mealData);
  
  // Assert
  expect(result.id).toBeDefined();
  expect(result.calories).toBe(350);
});
```

### 3. Mock External Dependencies
```typescript
// Mock fetch for API calls
(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: async () => mockData,
});
```

### 4. Test Edge Cases
- Empty inputs
- Invalid data
- Error conditions
- Boundary values

### 5. Keep Tests Independent
- Each test should be able to run in isolation
- Use `beforeEach` to reset state
- Don't rely on test execution order

## Common Testing Patterns

### Testing API Calls
```typescript
it('should fetch user data', async () => {
  const mockUser = { id: 1, name: 'John' };
  
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => mockUser,
  });
  
  const result = await base44.auth.me();
  
  expect(result).toEqual(mockUser);
  expect(global.fetch).toHaveBeenCalledWith('/api/auth/me');
});
```

### Testing User Interactions
```typescript
it('should submit form on button click', async () => {
  const mockSubmit = jest.fn();
  render(<MealForm onSubmit={mockSubmit} />);
  
  const input = screen.getByLabelText(/food name/i);
  await userEvent.type(input, 'Apple');
  
  const button = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(button);
  
  expect(mockSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ food_name: 'Apple' })
  );
});
```

### Testing Calculations
```typescript
it('should calculate BMI correctly', () => {
  const weight = 70; // kg
  const height = 170; // cm
  
  const bmi = calculateBMI(weight, height);
  
  expect(bmi).toBeCloseTo(24.22, 2);
});
```

## Debugging Tests

### Run single test with verbose output
```bash
npm test -- --verbose meal-tracking.test
```

### Debug test in VS Code
Add breakpoint and use "Debug Jest Tests" configuration

### View test coverage report
```bash
npm run test:coverage
# Opens coverage report in ./coverage/lcov-report/index.html
```

## Continuous Integration

Tests are designed to run in CI/CD pipelines:
- All tests should pass before deployment
- Coverage reports are generated automatically
- Failed tests block the build

## Future Test Additions

### Priority Areas:
1. **Component Tests:** Add tests for remaining UI components
2. **Performance Tests:** Test loading times and data volumes
3. **Security Tests:** Test authentication and authorization
4. **Visual Regression Tests:** Test UI consistency
5. **Accessibility Tests:** Test screen reader compatibility

### Components Needing Tests:
- [ ] ProfileForm
- [ ] WorkoutForm
- [ ] WorkoutsList
- [ ] MealsList
- [ ] TodayStats
- [ ] ProgressOverview
- [ ] QuickActions
- [ ] More...

## Troubleshooting

### Common Issues:

**Issue:** Tests timeout
**Solution:** Increase jest timeout in test file:
```typescript
jest.setTimeout(10000); // 10 seconds
```

**Issue:** Fetch is not defined
**Solution:** Ensure jest.setup.js is properly configured

**Issue:** Component rendering errors
**Solution:** Check mock implementations for Next.js hooks

**Issue:** Date-related test failures
**Solution:** Use fixed dates in tests, avoid `new Date()`

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass
3. Maintain or improve coverage percentage
4. Update this documentation if needed

---

**Last Updated:** January 2026
**Test Framework:** Jest 29.7.0
**React Testing Library:** 16.1.0

