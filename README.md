# Resume Customizer Frontend

Frontend application for the Resume Customizer service, built with **Angular 21**.

## Prerequisites

- Node.js 22+
- npm 10+
- Docker (optional, for containerized development)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

App will be available at `http://localhost:4200`

## Development

### Local Development

```bash
npm install
npm start
```

### Docker Development

```bash
docker compose -f docker-compose.dev.yml up
```

App will be available at `http://localhost:4200`

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests with Vitest |
| `npm run test:ci` | Run tests once (CI mode) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Auto-fix linting errors |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |

## Testing

```bash
npm test              # Run tests with Vitest
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

## Linting & Formatting

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
npm run format        # Format code with Prettier
npm run format:check  # Check formatting
```

## Building

```bash
npm run build                               # Development build
npm run build -- --configuration production # Production build
```

## Docker

### Development Container

```bash
docker compose -f docker-compose.dev.yml up
```

### Production Container

```bash
docker build -t resume-customizer-frontend:prod .
docker run -p 3000:3000 resume-customizer-frontend:prod
```

App will be available at `http://localhost:3000`

> **Note**: The frontend runs on port 3000 in production to avoid conflicts with the backend API (port 8080).

## Project Structure

```
src/
├── app/
│   ├── services/          # API and shared services
│   ├── app.config.ts      # Application configuration
│   ├── app.routes.ts      # Route definitions
│   ├── app.ts             # Root component
│   └── app.html           # Root template
├── environments/          # Environment configuration
│   ├── environment.ts     # Development
│   └── environment.prod.ts # Production
├── styles.scss            # Global styles & Material theme
└── main.ts                # Application bootstrap
```

## Angular 21 Features

This project uses Angular 21 patterns:

- **Standalone components** - No NgModules required
- **`inject()` function** - Modern dependency injection
- **`provide*` functions** - Functional providers in `app.config.ts`
- **Vitest** - Modern test runner (replaces Karma)
- **`@angular/build`** - New build system

## Environment Configuration

| Environment | API URL | File |
|-------------|---------|------|
| Development | `http://localhost:8080` | `environment.ts` |
| Production | `https://api.resumecustomizer.com` | `environment.prod.ts` |

## CI/CD

GitHub Actions workflows:

- **CI** (`ci.yml`): Runs on push/PR - lint, format, test, build
- **CD** (`cd.yml`): Runs on main - Docker build and push
- **Deploy Dev** (`deploy-dev.yml`): Deploy to development
- **Deploy Prod** (`deploy-prod.yml`): Deploy to production

