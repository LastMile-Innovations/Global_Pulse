# Contributing to Global Pulse

Thank you for your interest in contributing to the Global Pulse project! We appreciate your help in building the definitive, instantaneous barometer of global human perspective.

This document provides guidelines for contributing code, ensuring consistency, quality, and smooth collaboration.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md) (**TODO:** Create this file). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## Getting Started

Before you start contributing, please ensure you have followed the setup instructions in the [Getting Started Guide](getting_started.md). This guide covers cloning the repository, installing dependencies, setting up environment variables, and running the application locally.

If you have questions about setup or contribution process, feel free to ask in the designated communication channel (e.g., Slack, Discord - **TODO:** Specify channel if applicable) or open a GitHub Issue.

## Finding Issues to Work On

*   **GitHub Issues:** The primary place to find tasks is the [GitHub Issues tab](@https://github.com/LastMile-Innovations/Global_Pulse.git/issues) (**TODO:** Update URL).
*   **Labels:** Look for issues tagged with:
    *   `good first issue`: Ideal for newcomers.
    *   `help wanted`: Tasks the core team would appreciate help with.
    *   `bug`: Known issues that need fixing.
    *   `feature`: New functionality to be implemented.
    *   `documentation`: Improvements or additions to the docs.
*   **Project Board (Optional):** If a project board (e.g., GitHub Projects) is used, refer to it for prioritized tasks.
*   **Claiming an Issue:** If you decide to work on an issue, please leave a comment indicating your intention to prevent duplicated effort. If you haven't contributed before, starting with smaller issues (`good first issue`) is recommended.

## Branching Strategy

We follow a branching model similar to Gitflow:

*   `main`: Represents the latest production release. Direct commits are forbidden. Merges happen only from `develop` during a release process.
*   `develop`: The main development branch. Represents the latest stable development state. All feature and fix branches are merged into `develop`.
*   **Feature Branches:** Create branches off `develop` for new features.
    *   Naming: `feature/<feature-name>` (e.g., `feature/realtime-explore-updates`)
*   **Fix Branches:** Create branches off `develop` for bug fixes.
    *   Naming: `fix/<issue-description-or-number>` (e.g., `fix/dashboard-earnings-cache`, `fix/issue-123`)
*   **Release Branches (Optional):** Used for preparing production releases (`release/v1.x.x`). Branched off `develop`.
*   **Hotfix Branches (Optional):** Used for critical production bug fixes (`hotfix/v1.x.y`). Branched off `main`.

**General Rule:** Always create a new branch for your work; never commit directly to `main` or `develop`.

## Development Workflow

1.  **Ensure `develop` is Up-to-Date:**
    ```bash
    git checkout develop
    git pull origin develop
    ```
2.  **Create a New Branch:**
    ```bash
    # For features
    git checkout -b feature/<your-feature-name> develop

    # For fixes
    git checkout -b fix/<your-fix-name> develop
    ```
3.  **Code:** Make your changes. Write clean, well-commented, and efficient code following the project's style guides.
4.  **Test:** Write necessary tests (unit, integration) for your changes. Ensure all existing and new tests pass. Run tests locally: `pnpm test` (**TODO:** Add test script to `package.json` if not present).
5.  **Lint & Format:** Ensure your code adheres to the project's linting and formatting rules:
    ```bash
    pnpm lint
    pnpm format
    ```
6.  **Commit:** Stage your changes and write clear, descriptive commit messages (see [Commit Messages](#commit-messages)).
    ```bash
    git add .
    git commit -m "feat: Implement user earnings display on dashboard"
    ```
7.  **Push:** Push your branch to the remote repository (your fork or the main repo):
    ```bash
    git push origin feature/<your-feature-name>
    ```
8.  **Create Pull Request:** Open a Pull Request on GitHub (see [Submitting Pull Requests](#submitting-pull-requests-prs)).

## Coding Style & Conventions

*   **Language:** TypeScript is used throughout the project. Adhere to strong typing practices.
*   **Linting:** We use ESLint. Run `pnpm lint` to check for issues. Configuration is typically in `.eslintrc.js` or `package.json`.
*   **Formatting:** We use Prettier for consistent code formatting. Run `pnpm format` to format your code. Configuration is typically in `.prettierrc.js` or `package.json`.
*   **Framework Conventions:** Follow Next.js (App Router), React (Hooks, Purity), and Drizzle conventions. Refer to the project's specific technology guides in `/docs`.
*   **File Naming:** Use kebab-case for file and folder names (e.g., `user-dashboard.tsx`).
*   **Comments:** Add comments to explain complex logic, assumptions, or non-obvious code sections.

## Commit Messages

We encourage using the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps create an explicit commit history and makes automating release notes easier.

**Format:**

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Common Types:**

*   `feat`: A new feature.
*   `fix`: A bug fix.
*   `docs`: Documentation only changes.
*   `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
*   `refactor`: A code change that neither fixes a bug nor adds a feature.
*   `perf`: A code change that improves performance.
*   `test`: Adding missing tests or correcting existing tests.
*   `build`: Changes that affect the build system or external dependencies.
*   `ci`: Changes to our CI configuration files and scripts.
*   `chore`: Other changes that don't modify src or test files.

**Example:**

```
feat(explore): Add AI summary generation button and action

Implements the frontend button and the backend Server Action
using Vercel AI SDK to generate text summaries for aggregated
survey results. Fetches data via Drizzle and calls generateText.

Closes #45
```

## Testing

*   Contributions should include appropriate tests. Refer to the [Testing Strategy](testing_strategy.md) document (**TODO**) for details on the types of tests expected.
*   Ensure all tests pass locally before submitting a PR: `pnpm test` (**TODO:** Add script).
*   CI pipeline will also run tests automatically.

## Submitting Pull Requests (PRs)

1.  Push your feature/fix branch to GitHub.
2.  Navigate to the main repository on GitHub.
3.  Click "New pull request".
4.  Select your branch as the "compare" branch and `develop` as the "base" branch.
5.  **Write a Clear Description:**
    *   Provide a concise title summarizing the change.
    *   Link the relevant GitHub Issue(s) (e.g., `Closes #123`).
    *   Describe *what* changes were made and *why*.
    *   Include steps for reviewers to test the changes locally or provide screenshots/GIFs if applicable.
    *   Mention any potential drawbacks or areas needing further discussion.
6.  **Ensure CI Checks Pass:** Wait for automated checks (linting, tests, build) to complete successfully. Fix any reported issues.
7.  **Request Reviewers:** Request reviews from relevant team members or maintainers (if permissions allow, otherwise maintainers will assign).

## Code Review Process

*   **Authors:** Be responsive to feedback. Explain your reasoning if you disagree with a suggestion. Update your PR promptly based on agreed-upon changes. Push follow-up commits to the same branch (avoid force-pushing unless requested).
*   **Reviewers:** Provide constructive, respectful feedback. Focus on the code's correctness, clarity, performance, security, and adherence to project standards. Offer suggestions for improvement. Approve the PR once you are satisfied.
*   At least one approval (or more, depending on project policy) is typically required before merging.
*   The PR will be merged into `develop` by a maintainer once approved and all checks pass.

## Questions?

If you have questions, need clarification, or want to discuss an approach before implementation:

*   Comment on the relevant GitHub Issue.
*   Ask in the designated project communication channel (**TODO:** Specify channel).

Thank you for contributing to Global Pulse!
