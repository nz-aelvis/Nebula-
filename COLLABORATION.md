# Collaboration Guide

Welcome to the Nebula ERP team! This document outlines how we work together to build a world-class application.

## Code of Conduct

*   Be respectful and constructive in code reviews.
*   Prioritize user experience and performance.
*   Write self-documenting code where possible.

## Version Control Workflow

We follow a **Feature Branch** workflow:

1.  **Main Branch**: `main` is production-ready. Never push directly to main.
2.  **Develop Branch**: `develop` is the staging area.
3.  **Feature Branches**: Create branches from `develop` named `feature/your-feature-name`.

### Commits
Use semantic commit messages:
*   `feat: add new POS layout`
*   `fix: resolve inventory calculation bug`
*   `docs: update API documentation`

## Code Style & Standards

### TypeScript
*   **Strict Mode**: Always define types in `types.ts`. Avoid `any` whenever possible.
*   **Interfaces**: Use Interfaces for data models (Product, Order) and Types for unions (Status, Role).

### React
*   **Functional Components**: Use React.FC with typed props.
*   **Hooks**: Place hooks at the top of the component.
*   **Naming**: PascalCase for components (`Inventory.tsx`), camelCase for functions/vars.

### Tailwind CSS
*   Use utility classes for layout and spacing.
*   Avoid inline styles (`style={{}}`) unless strictly necessary for dynamic values.
*   Maintain consistency with the color palette (`slate-900` for primary UI, `blue-600` for actions).

## Pull Requests (PR)

1.  Ensure your branch is up to date with `develop`.
2.  Run manual tests (see `TESTING.md`).
3.  Create a PR with a description of changes and screenshots if UI is affected.
4.  Require at least one peer review before merging.

## Issue Tracking

*   **Bug Reports**: Include reproduction steps, expected vs actual behavior, and error logs.
*   **Feature Requests**: Describe the "Why" and the "What", including user benefit.
