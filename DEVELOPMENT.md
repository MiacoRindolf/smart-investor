# SmartInvestor Development Guide

## 🏗️ Architecture Overview

SmartInvestor is a full-stack React application with a Node.js backend proxy for reliable market data.

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── StockAnalysis.tsx    # Stock analysis component
│   ├── PatternManager.tsx   # Custom pattern management
│   └── AIChat.tsx      # AI chat interface
├── pages/              # Main application pages
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Market.tsx      # Market overview and patterns
│   ├── Trading.tsx     # Trading simulation
│   └── Education.tsx   # Educational content
├── services/           # API and data services
│   ├── api.ts          # Alpha Vantage API integration
│   ├── yahooFinanceService.ts  # Yahoo Finance service
│   ├── patternService.ts       # Pattern matching logic
│   └── database.ts     # Local storage service
├── store/              # State management (Zustand)
│   └── useStore.ts     # Main application state
├── utils/              # Utility functions
│   └── helpers.ts      # Common helper functions
├── types/              # TypeScript type definitions
│   └── index.ts        # Main type definitions
└── config/             # Configuration
    └── constants.ts    # Application constants
```

### Backend Architecture
```
server/
├── index.js            # Main server file
├── routes/             # API routes
│   └── yahoo.js        # Yahoo Finance API routes
├── services/           # Business logic
│   └── yahooService.js # Yahoo Finance service
└── README.md           # Backend documentation
```

## 🔄 Data Flow

### Stock Data Sources (Priority Order)
1. **Alpha Vantage API** - Primary source (requires API key)
2. **Yahoo Finance Backend** - Fallback (free, via Node.js proxy)
3. **Local Cache** - Last resort (stored in IndexedDB)

### State Management
- **Zustand Store**: Central state for user data, watchlist, portfolio
- **Local Storage**: User preferences, settings
- **IndexedDB**: Stock price history, news cache

## 🎨 UI/UX Guidelines

### Design System
- **Colors**: Tailwind CSS with custom color palette
- **Typography**: Inter font family
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable UI components in `src/components/ui/`

### Responsive Design
- **Mobile-first**: Design for mobile, enhance for desktop
- **Breakpoints**: Tailwind's default breakpoints
- **Touch-friendly**: Minimum 44px touch targets

### Accessibility
- **Semantic HTML**: Proper heading hierarchy
- **ARIA labels**: Screen reader support
- **Keyboard navigation**: Full keyboard accessibility
- **Color contrast**: WCAG AA compliant

## 📝 Coding Standards

### TypeScript
- **Strict mode**: Enable all strict TypeScript options
- **Type definitions**: Define interfaces for all data structures
- **Generic types**: Use generics for reusable components
- **No any types**: Avoid `any` type, use proper typing

### React Best Practices
- **Functional components**: Use hooks and functional components
- **Custom hooks**: Extract reusable logic into custom hooks
- **Props interface**: Define props interface for each component
- **Error boundaries**: Wrap components in error boundaries

### Code Organization
- **Single responsibility**: Each file has one clear purpose
- **Consistent naming**: Use descriptive, consistent names
- **File structure**: Follow established directory structure
- **Import order**: Group imports logically

### Performance
- **Lazy loading**: Use React.lazy for code splitting
- **Memoization**: Use React.memo and useMemo appropriately
- **Bundle size**: Keep dependencies minimal
- **Image optimization**: Optimize images and use lazy loading

## 🧪 Testing Strategy

### Unit Testing
- **Component testing**: Test individual components
- **Service testing**: Test API services and utilities
- **Hook testing**: Test custom hooks
- **Mock data**: Use consistent mock data

### Integration Testing
- **API integration**: Test API calls and responses
- **State management**: Test Zustand store updates
- **User flows**: Test complete user journeys

### Manual Testing
- **Cross-browser**: Test in Chrome, Firefox, Safari, Edge
- **Mobile devices**: Test on iOS and Android
- **Accessibility**: Test with screen readers
- **Performance**: Monitor bundle size and load times

## 🚀 Development Workflow

### Setup
1. **Clone repository**
2. **Install dependencies**: `npm install`
3. **Set up environment**: Create `.env` file
4. **Start development**: `npm run dev`

### Development Process
1. **Create feature branch**: `git checkout -b feature/name`
2. **Make changes**: Follow coding standards
3. **Test changes**: Run tests and manual testing
4. **Commit changes**: Use conventional commit messages
5. **Create PR**: Submit pull request with description

### Commit Messages
Use conventional commit format:
```
type(scope): description

feat(api): add Yahoo Finance fallback
fix(ui): resolve button alignment issue
docs(readme): update setup instructions
```

## 🔧 Configuration

### Environment Variables
```env
# Alpha Vantage API (optional)
VITE_ALPHA_VANTAGE_API_KEY=your_api_key

# OpenAI API (optional)
VITE_OPENAI_API_KEY=your_openai_key

# Backend URL (optional, defaults to localhost:4000)
VITE_BACKEND_URL=http://localhost:4000
```

### Build Configuration
- **Vite**: Fast development and optimized builds
- **TypeScript**: Strict type checking
- **Tailwind**: Utility-first CSS framework
- **PostCSS**: CSS processing and optimization

## 📊 Performance Monitoring

### Metrics to Track
- **Bundle size**: Keep under 500KB gzipped
- **Load time**: Target under 3 seconds
- **API response time**: Monitor API performance
- **Memory usage**: Check for memory leaks

### Optimization Techniques
- **Code splitting**: Split by routes and features
- **Tree shaking**: Remove unused code
- **Caching**: Implement proper caching strategies
- **Lazy loading**: Load components on demand

## 🐛 Debugging

### Frontend Debugging
- **React DevTools**: Component inspection
- **Redux DevTools**: State management debugging
- **Network tab**: API call monitoring
- **Console logging**: Strategic console.log statements

### Backend Debugging
- **Node.js debugging**: Use debugger statements
- **Logging**: Structured logging with levels
- **Error handling**: Comprehensive error catching
- **API testing**: Test endpoints with tools like Postman

## 🔒 Security Considerations

### Frontend Security
- **Environment variables**: Never expose sensitive data
- **Input validation**: Validate all user inputs
- **XSS prevention**: Sanitize user-generated content
- **CORS**: Configure proper CORS policies

### Backend Security
- **Rate limiting**: Prevent API abuse
- **Input validation**: Validate all API inputs
- **Error handling**: Don't expose sensitive information
- **Dependencies**: Keep dependencies updated

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

### Tools
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind CSS Playground](https://play.tailwindcss.com/)

### Learning Resources
- [React Patterns](https://reactpatterns.com/)
- [TypeScript Best Practices](https://github.com/typescript-eslint/typescript-eslint)
- [Modern CSS Techniques](https://moderncss.dev/) 