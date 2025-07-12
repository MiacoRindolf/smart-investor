# Pre-Commit Setup Guide

This project uses a comprehensive pre-commit setup to ensure code quality, security, and consistency.

## 🛠️ Tools Included

### 1. **Secret Detection**
- **Tool**: `detect-secrets` (Yelp)
- **Purpose**: Scans for API keys, tokens, and other secrets
- **Baseline**: `.secrets.baseline` (tracks known safe patterns)

### 2. **Code Formatting**
- **Tool**: `prettier`
- **Purpose**: Consistent code formatting across the project
- **Config**: `.prettierrc`

### 3. **Linting & Code Quality**
- **Tool**: `eslint` with TypeScript and React plugins
- **Purpose**: Code quality, security, and accessibility checks
- **Config**: `.eslintrc.json`

### 4. **Type Checking**
- **Tool**: `typescript` compiler
- **Purpose**: Ensures type safety before commits

### 5. **Commit Message Validation**
- **Tool**: `commitlint`
- **Purpose**: Enforces conventional commit message format
- **Config**: `commitlint.config.js`

### 6. **Security Scanning**
- **Tool**: `eslint-plugin-security`
- **Purpose**: Detects common security vulnerabilities

### 7. **Accessibility**
- **Tool**: `eslint-plugin-jsx-a11y`
- **Purpose**: Ensures accessibility best practices

## 🚀 Quick Start

### Installation
```bash
# Install dependencies (already done)
npm install

# Install pre-commit hooks
python -m pre_commit install

# Install commit-msg hook for commit message validation
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

### Running Checks Manually
```bash
# Run all pre-commit checks
npm run pre-commit

# Run specific checks
npm run lint          # ESLint
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier formatting
npm run format:check  # Check formatting
npm run type-check    # TypeScript check
```

## 📝 Commit Message Format

Use conventional commit format:
```
type(scope): description

feat(api): add real-time stock data integration
fix(ui): resolve chart rendering issue
docs(readme): update installation instructions
style(components): format code with prettier
refactor(store): simplify state management
test(api): add unit tests for stock service
chore(deps): update dependencies
```

### Valid Types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code formatting
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `revert`: Reverting changes
- `security`: Security improvements
- `breaking`: Breaking changes

## 🔒 Security Features

### Secret Detection
- Automatically scans for API keys, tokens, passwords
- Blocks commits containing secrets
- Maintains baseline of known safe patterns

### Security Rules
- Detects unsafe regex patterns
- Warns about potential timing attacks
- Checks for eval usage
- Validates file system operations

### Accessibility
- Enforces ARIA attributes
- Checks for proper heading structure
- Validates form labels and controls
- Ensures keyboard navigation

## 🎯 Workflow

### Before Every Commit:
1. **Secret Scan**: Checks for API keys/tokens
2. **Formatting**: Ensures consistent code style
3. **Linting**: Validates code quality and security
4. **Type Check**: Ensures TypeScript type safety
5. **Tests**: Runs test suite (if available)

### Before Every Push:
1. **Build Check**: Ensures project builds successfully
2. **Lock File Check**: Validates package consistency
3. **All Pre-commit Checks**: Re-runs all checks

## 🔧 Configuration Files

### `.pre-commit-config.yaml`
Main configuration for all pre-commit hooks

### `.eslintrc.json`
ESLint configuration with security and accessibility rules

### `.prettierrc`
Code formatting rules

### `commitlint.config.js`
Commit message validation rules

### `.secrets.baseline`
Baseline for secret detection (auto-generated)

## 🚨 Troubleshooting

### Hook Fails
```bash
# Skip hooks for this commit (emergency only)
git commit --no-verify -m "emergency fix"

# Run hooks manually
npm run pre-commit
```

### Update Secret Baseline
```bash
# After intentionally adding new secrets
python -m detect_secrets scan > .secrets.baseline
git add .secrets.baseline
```

### Fix Formatting Issues
```bash
# Auto-fix formatting
npm run format

# Auto-fix linting issues
npm run lint:fix
```

### Update Dependencies
```bash
# Update pre-commit hooks
python -m pre_commit autoupdate

# Update npm dependencies
npm update
```

## 📊 Benefits

### For Developers:
- **Consistent Code**: Automatic formatting and linting
- **Early Bug Detection**: Type checking and linting catch issues early
- **Security**: Automatic secret detection and security scanning
- **Quality**: Enforced code quality standards

### For Teams:
- **Standardization**: Consistent code style across team
- **Security**: Prevents accidental secret leaks
- **Accessibility**: Ensures inclusive design
- **Documentation**: Clear commit history with conventional commits

### For Projects:
- **Maintainability**: Clean, consistent codebase
- **Security**: Reduced risk of vulnerabilities
- **Compliance**: Accessibility and security standards
- **Professional**: Industry-standard development practices

## 🔄 Continuous Integration

The pre-commit checks are also integrated into the GitHub Actions CI pipeline:

- Runs on every pull request
- Ensures code quality before merging
- Provides feedback on code changes
- Maintains consistent standards

## 📚 Additional Resources

- [Pre-commit Documentation](https://pre-commit.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ESLint Security Rules](https://github.com/nodesecurity/eslint-plugin-security)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [Detect Secrets](https://github.com/Yelp/detect-secrets) 