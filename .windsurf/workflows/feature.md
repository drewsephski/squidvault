---
description: Create a feature branch, commit changes, and open a pull request with automatic change detection
tags: [git, workflow, pr, branch]
---

# Feature Branch → Commit → PR Workflow (Auto-Detect)

Intelligently analyzes uncommitted changes to auto-generate branch names and commit messages.

## Usage

```
/feature                    # Auto-detect everything from changes
/feature <custom-message>   # Use custom commit message, auto-detect branch
/feature --dry-run          # Preview what would be created without executing
```

## Auto-Detection Logic

### Step 1: Analyze Changes
```bash
# Check what files changed
git diff --name-only
git diff --stat

# Check diff content for context
git diff --cached
git diff
```

### Step 2: Generate Branch Name
Based on file paths and diff patterns:

| Pattern | Branch Prefix | Example |
|---------|--------------|---------|
| `app/**`, `pages/**`, `components/**` | `feat/` | `feat/add-user-profile` |
| `lib/auth*`, `middleware*`, `auth/**` | `auth/` | `auth/fix-oauth-redirect` |
| `fix*`, `bug*`, error handling | `fix/` | `fix/null-pointer-exception` |
| `test/**`, `*.test.*`, `*.spec.*` | `test/` | `test/add-login-tests` |
| `docs/**`, `README*`, `*.md` | `docs/` | `docs/update-api-guide` |
| `styles/**`, `*.css`, `*.scss` | `style/` | `style/refactor-buttons` |
| `db/**`, `migrations/**`, `schema*` | `db/` | `db/add-user-table` |
| `api/**`, `routes/**` | `api/` | `api/rate-limiting` |

### Step 3: Generate Commit Message
Analyzes diff for keywords and patterns:

```bash
# Extract keywords from diff
git diff | grep -E "^[\+\-]" | head -50
```

**Detection Rules:**
- `+.*function`, `+.*export`, `+.*class` → `feat: add/implement <feature>`
- `-.*function`, `refactor`, `move` → `refactor: <description>`
- `fix`, `bug`, `error`, `catch` → `fix: resolve <issue>`
- `test`, `describe`, `it(` → `test: add tests for <feature>`
- `docs`, `comment`, `README` → `docs: update <what>`
- `style`, `css`, `className` → `style: update <element>`
- `chore`, `config`, `package.json` → `chore: <task>`

## Full Workflow Steps

### 1. Detect and Create Branch
```bash
# Analyze changes
CHANGED_FILES=$(git diff --name-only)
MAIN_FILE=$(echo "$CHANGED_FILES" | head -1)

# Generate prefix based on path
if echo "$CHANGED_FILES" | grep -qE "(test|spec)\.(ts|tsx|js|jsx)$"; then
  PREFIX="test"
elif echo "$CHANGED_FILES" | grep -qE "^docs/|\.md$"; then
  PREFIX="docs"
elif echo "$CHANGED_FILES" | grep -qE "(fix|bug|error)"; then
  PREFIX="fix"
elif echo "$CHANGED_FILES" | grep -qE "(style|css|scss|tailwind)"; then
  PREFIX="style"
else
  PREFIX="feat"
fi

# Generate branch name from main file
BRANCH_NAME="${PREFIX}/$(echo $MAIN_FILE | sed 's/\//-/g' | sed 's/\.[^.]*$//' | cut -c1-40)"

# Create branch
git checkout -b "$BRANCH_NAME"
```

// turbo
### 2. Stage and Commit
```bash
git add -A

# Auto-generate commit message if not provided
if [ -z "$COMMIT_MSG" ]; then
  # Analyze staged changes
  if git diff --cached --name-only | grep -q "test"; then
    TYPE="test"
  elif git diff --cached --name-only | grep -q "docs"; then
    TYPE="docs"
  elif git diff --cached | grep -q "^\-.*function\|^\-.*export"; then
    TYPE="refactor"
  elif git diff --cached | grep -q "fix\|bug\|error"; then
    TYPE="fix"
  else
    TYPE="feat"
  fi
  
  # Extract feature name from changes
  FEATURE=$(git diff --cached --name-only | head -1 | xargs basename | sed 's/\.[^.]*$//')
  COMMIT_MSG="${TYPE}: update ${FEATURE}"
fi

git commit -m "$COMMIT_MSG"
```

// turbo
### 3. Push and Create PR
```bash
git push -u origin "$BRANCH_NAME"

# Auto-generate PR title from commit
PR_TITLE=$(git log -1 --pretty=%s)
gh pr create --title "$PR_TITLE" --body "$(git log -1 --pretty=%b)" --base main
```

## Options

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview branch/message without executing |
| `--draft` | Create PR as draft |
| `--base <branch>` | Target branch (default: main) |
| `--message "msg"` | Override auto-generated commit message |
| `--branch "name"` | Override auto-generated branch name |

## Examples

```
/feature                    # Auto: feat/login-page based on changes
/feature --dry-run          # Preview: Would create feat/login-page
/feature "Add dark mode"    # Custom commit, auto branch
```

## Manual Override

To fully control the workflow:

```
/feature --branch "custom/name" --message "feat: manual description"
```
