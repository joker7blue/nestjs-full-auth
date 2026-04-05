# Contributing to NestJS Full Authentication System

First off, thank you for considering contributing to this project! 🎉

This document provides guidelines for contributing to our authentication system. Following these guidelines helps maintain code quality and makes the review process smoother for everyone.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Security Guidelines](#security-guidelines)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project adheres to a code of conduct. By participating, you're expected to uphold this code. Please report unacceptable behavior to the project maintainers.

- **Be respectful** and inclusive
- **Be constructive** in discussions and feedback
- **Focus on the code**, not the person
- **Help others** learn and grow

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0 (or yarn/pnpm equivalent)
- PostgreSQL database
- Git
- VS Code (recommended) with these extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Jest

### First-time Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/nest-full-auth.git
   cd nest-full-auth
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/nest-full-auth.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your local database credentials
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   npm run db:seed  # Optional: seed with test data
   ```

6. **Verify setup**
   ```bash
   npm run test        # Run tests
   npm run start:dev   # Start development server
   ```

## 🛠️ Development Setup

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Recommended Workflow
```bash
# 1. Stay up to date
git checkout main
git pull upstream main

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes (see coding standards below)

# 4. Test your changes
npm run test
npm run lint
npm run format

# 5. Commit your changes (see commit guidelines)
git add .
git commit -m "feat: add user profile validation"

# 6. Push and create PR
git push origin feature/your-feature-name
```

## 🎯 How to Contribute

### Types of Contributions

#### 🐛 Bug Reports
- Use the bug report template
- Include clear steps to reproduce
- Provide relevant logs and error messages
- Specify your environment (OS, Node.js version, etc.)

#### ✨ Feature Requests
- Use the feature request template
- Explain the use case and business value
- Consider backward compatibility
- Include mockups or examples if applicable

#### 📝 Code Contributions
- Follow the coding standards below
- Add unit tests for new functionality
- Update documentation as needed
- Ensure CI passes

#### 📚 Documentation
- Fix typos and improve clarity
- Add examples and use cases
- Update API documentation
- Improve setup instructions

### Areas That Need Help
- [ ] OAuth provider integrations (Facebook, Twitter, etc.)
- [ ] Email templates and styling
- [ ] Rate limiting configurations
- [ ] Input validation improvements
- [ ] Performance optimizations
- [ ] Documentation improvements
- [ ] Test coverage improvements

## 💻 Coding Standards

### TypeScript Guidelines
```typescript
// ✅ Good: Use explicit types
interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
}

// ❌ Bad: Using 'any'
function processUser(user: any) { }

// ✅ Good: Proper error handling
try {
  const user = await this.userService.create(createUserDto);
  return { success: true, user };
} catch (error) {
  this.logger.error('Failed to create user', error.stack);
  throw new BadRequestException('User creation failed');
}
```

### File and Directory Structure
```
src/
├── feature-name/
│   ├── feature-name.module.ts
│   ├── feature-name.controller.ts
│   ├── feature-name.service.ts
│   ├── feature-name.service.spec.ts
│   ├── dto/
│   │   ├── create-feature.dto.ts
│   │   └── update-feature.dto.ts
│   └── entities/
│       └── feature.entity.ts
```

### Naming Conventions
- **Files**: `kebab-case.type.ts` (e.g., `user-profile.service.ts`)
- **Classes**: `PascalCase` (e.g., `UserProfileService`)
- **Methods**: `camelCase` (e.g., `createUserProfile`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `MAX_LOGIN_ATTEMPTS`)
- **Interfaces**: `PascalCase` with descriptive names (e.g., `CreateUserRequest`)

### Code Quality Guidelines
- **Single Responsibility**: Each class/function should have one purpose
- **DRY Principle**: Don't repeat yourself
- **SOLID Principles**: Follow object-oriented design principles
- **Error Handling**: Always handle errors gracefully
- **Logging**: Use appropriate log levels (debug, info, warn, error)
- **Security**: Validate all inputs, sanitize outputs

### ESLint and Prettier
The project uses ESLint and Prettier for code formatting. Run before committing:
```bash
npm run lint      # Check for linting issues
npm run lint:fix  # Auto-fix linting issues
npm run format    # Format code with Prettier
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
# Feature
feat(auth): add OAuth Google integration

# Bug fix
fix(users): resolve email validation bug

# Documentation
docs(readme): update installation instructions

# Breaking change
feat(auth)!: migrate to JWT version 9

BREAKING CHANGE: JWT tokens now require different validation
```

## 🔄 Pull Request Process

### Before Submitting
- [ ] Code follows project conventions
- [ ] Tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation is updated
- [ ] No merge conflicts
- [ ] Commits follow conventional format

### PR Template
Use the provided PR template and include:
- **Description**: What does this PR do?
- **Type**: Feature, bugfix, documentation, etc.
- **Testing**: How was this tested?
- **Screenshots**: For UI changes
- **Breaking Changes**: List any breaking changes

### Review Process
1. **Automated Checks**: CI must pass
2. **Code Review**: At least one maintainer review
3. **Testing**: Reviewers may test functionality
4. **Approval**: Required before merging

### After Approval
- Maintainers will merge using "Squash and merge"
- Your branch will be automatically deleted
- Update any related issues

## 🧪 Testing Guidelines

### Test Coverage Requirements
- **Unit Tests**: All services and utilities (>90% coverage)
- **Integration Tests**: All controllers and modules
- **E2E Tests**: Critical user flows

### Test Structure
```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 1;
      const expectedUser = { id: userId, email: 'test@example.com' };
      repository.findOne.mockResolvedValue(expectedUser);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
```

### Test Commands
```bash
npm run test              # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Run with coverage report
npm run test:e2e          # Run end-to-end tests
npm run test:debug        # Debug tests
```

## 🔒 Security Guidelines

### Security First Approach
When contributing to this authentication system, security is paramount:

#### Input Validation
```typescript
// ✅ Good: Validate all inputs
@IsEmail()
@IsNotEmpty()
email: string;

@IsString()
@MinLength(8)
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
password: string;
```

#### Sensitive Data
- **Never log passwords or tokens**
- **Use environment variables** for secrets
- **Hash passwords** before storing
- **Validate JWT tokens** properly

#### Common Vulnerabilities
- ❌ SQL Injection (use parameterized queries)
- ❌ XSS (sanitize inputs)
- ❌ CSRF (use proper headers)
- ❌ Rate limiting bypass
- ❌ Information disclosure

### Security Review Checklist
- [ ] Input validation on all endpoints
- [ ] Proper authentication/authorization
- [ ] No sensitive data in logs
- [ ] Rate limiting implemented
- [ ] Error messages don't leak information

## 📚 Documentation

### API Documentation
- Use **Swagger/OpenAPI** decorators
- Include **examples** and **descriptions**
- Document **error responses**

```typescript
@ApiOperation({ summary: 'Create a new user' })
@ApiResponse({ status: 201, description: 'User created successfully' })
@ApiResponse({ status: 400, description: 'Invalid input data' })
@Post()
async createUser(@Body() createUserDto: CreateUserDto) {
  // Implementation
}
```

### Code Documentation
- **JSDoc comments** for complex functions
- **README updates** for new features
- **Architecture decisions** in ADR format
- **Migration guides** for breaking changes

## ❓ Questions and Support

### Getting Help
- **Discord**: Join our community Discord server
- **GitHub Discussions**: For general questions
- **GitHub Issues**: For bug reports and feature requests
- **Stack Overflow**: Tag your questions with `nestjs-auth`

### Resources
- [NestJS Documentation](https://docs.nestjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

## 🎉 Recognition

Contributors will be:
- Added to the **Contributors** section in README
- Mentioned in **release notes** for significant contributions
- Eligible for **contributor swag** (coming soon!)

Thank you for helping make this authentication system better! 🚀