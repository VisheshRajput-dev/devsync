# Contributing to Devsync

Thank you for your interest in contributing to Devsync! This document provides guidelines and instructions for contributing.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Making Changes](#making-changes)
5. [Code Style](#code-style)
6. [Testing](#testing)
7. [Pull Request Process](#pull-request-process)
8. [Reporting Issues](#reporting-issues)
9. [Feature Requests](#feature-requests)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of age, background, experience level, gender, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory comments
- Trolling or insulting remarks
- Personal or political attacks
- Public or private harassment
- Publishing others' private information without permission

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and Node.js

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/devsync.git
   cd devsync
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/devsync.git
   ```

4. **Install dependencies**:
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   cd ..
   ```

## Development Setup

### Environment Setup

1. **Create `.env` file** in root:
   ```env
   VITE_SOCKET_URL=http://localhost:3002
   ```

2. **Create `backend/.env` file**:
   ```env
   PORT=3002
   CORS_ORIGIN=http://localhost:5174,http://localhost:5175,http://localhost:5176
   ```

3. **Start development servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

### Project Structure

```
devsync/
├── backend/           # Backend server code
│   ├── server.js     # Main server file
│   └── rateLimiter.js
├── src/              # Frontend source code
│   ├── components/   # React components
│   ├── pages/       # Page components
│   ├── contexts/     # React contexts
│   ├── hooks/       # Custom hooks
│   ├── lib/         # Utilities
│   └── types/       # TypeScript types
└── public/          # Static assets
```

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Testing

**Examples:**
- `feature/add-comment-system`
- `fix/file-upload-bug`
- `docs/update-readme`

### Workflow

1. **Update your fork**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**:
   - Write clean, readable code
   - Follow code style guidelines
   - Add comments where needed
   - Update documentation if needed

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

   **Commit Message Format:**
   - Use conventional commits: `type: description`
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Example: `feat: add auto-save functionality`

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define proper types/interfaces
- Avoid `any` type (use `unknown` if needed)

**Example:**
```typescript
interface UserProps {
  id: string;
  username: string;
}

const UserComponent: React.FC<UserProps> = ({ id, username }) => {
  // Component code
};
```

### React

- Use functional components and hooks
- Use `useCallback` and `useMemo` for optimization
- Extract reusable logic to custom hooks
- Keep components small and focused

**Example:**
```typescript
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<StateType>(initialState);
  
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Naming Conventions

- **Components**: PascalCase (`UserList.tsx`)
- **Files**: PascalCase for components, camelCase for utils (`utils.ts`)
- **Variables/Functions**: camelCase (`handleClick`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`CodeFile`)

### Formatting

- Use Prettier (auto-format on save)
- Line length: 80-100 characters
- Use 2 spaces for indentation
- Always use semicolons
- Trailing commas in multi-line objects/arrays

### Comments

- Write self-documenting code
- Add comments for complex logic
- Use JSDoc for functions/components
- Keep comments up-to-date

**Example:**
```typescript
/**
 * Validates file name according to system rules
 * @param name - File name to validate
 * @returns Validation result with error message if invalid
 */
const validateFileName = (name: string): ValidationResult => {
  // Implementation
};
```

## Testing

### Manual Testing

Before submitting PR:

1. **Test locally**:
   - Start both frontend and backend
   - Test your feature thoroughly
   - Test edge cases
   - Test error scenarios

2. **Test different browsers**:
   - Chrome
   - Firefox
   - Edge

3. **Test responsive design**:
   - Desktop
   - Tablet
   - Mobile

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] No console.log statements (except for debugging, then remove)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Tested manually
- [ ] Documentation updated if needed
- [ ] Commit messages are clear

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run linter**:
   ```bash
   npm run lint
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

### Creating Pull Request

1. **Push your branch** to your fork
2. **Open PR** on GitHub:
   - Use clear title
   - Provide detailed description
   - Link related issues
   - Add screenshots if UI changes

3. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   How was this tested?
   
   ## Screenshots (if applicable)
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings
   - [ ] Tested on multiple browsers
   ```

### Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Make requested changes
4. PR will be merged when approved

## Reporting Issues

### Bug Reports

Use the GitHub issue template:

**Title:** Clear, descriptive title

**Description:**
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment (OS, browser, Node version)

**Example:**
```
**Bug Description:**
File upload fails for files larger than 1MB

**Steps to Reproduce:**
1. Click Upload button
2. Select file > 1MB
3. See error

**Expected:**
File uploads successfully (up to 5MB limit)

**Actual:**
Error message appears

**Environment:**
- OS: Windows 11
- Browser: Chrome 120
- Node: 22.12.0
```

### Feature Requests

1. **Check existing issues** first
2. **Use feature request template**:
   - Description of feature
   - Use case
   - Proposed solution
   - Alternatives considered

## Feature Requests

### Proposing Features

1. **Open discussion** or issue
2. **Get feedback** from maintainers
3. **Implement** if approved
4. **Submit PR** with feature

### Large Features

For major features:
1. Open issue for discussion
2. Get approval before implementing
3. Break into smaller PRs
4. Coordinate with maintainers

## Development Tips

### Debugging

- Use browser DevTools
- Check Network tab for WebSocket
- Use React DevTools
- Add temporary console.log (remove before PR)

### Performance

- Avoid unnecessary re-renders
- Use React.memo for expensive components
- Optimize large lists
- Profile with React DevTools Profiler

### Git Best Practices

- Make small, focused commits
- Write clear commit messages
- Rebase instead of merge
- Keep PRs focused on one feature

### Common Mistakes to Avoid

- ❌ Committing `node_modules` or `.env` files
- ❌ Leaving console.log statements
- ❌ Pushing to main branch
- ❌ Breaking existing functionality
- ❌ Ignoring TypeScript errors
- ❌ Not testing changes

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open an Issue
- **Feature Ideas**: Open an Issue with "feature" label
- **Code Questions**: Ask in PR comments

## Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Appreciated by the community! 🙏

---

**Thank you for contributing to Devsync! 🚀**

For more information:
- [README](./README.md) - Project overview
- [User Guide](./USER_GUIDE.md) - User documentation
- [API Documentation](./API_DOCUMENTATION.md) - API reference

