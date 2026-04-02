---
description: Build the project and commit changes with auto-generated messages
tags: [git, build, commit, workflow]
---

# Build & Commit Workflow

Builds the project, verifies it compiles, and commits changes with smart message generation.

## Usage

```
/commit                    # Auto-build and commit all changes
/commit <message>          # Build and commit with custom message
/commit --no-build         # Skip build step, just commit
/commit --dry-run          # Preview what would be committed
```

## Steps

### 1. Check for Changes
```bash
git diff --name-only
git status
```

// turbo
### 2. Build Project
```bash
# Detect build system and run appropriate command
if [ -f "package.json" ]; then
  if grep -q "build" package.json; then
    npm run build || yarn build || pnpm build || bun run build
  fi
elif [ -f "Cargo.toml" ]; then
  cargo build --release
elif [ -f "go.mod" ]; then
  go build
elif [ -f "Makefile" ]; then
  make build
fi
```

### 3. Stage Changes
```bash
git add -A
```

// turbo
### 4. Generate Commit Message

Auto-detects commit type from staged files:

| Pattern | Type | Example |
|---------|------|---------|
| `fix`, `bug`, `error` | `fix:` | `fix: resolve null pointer` |
| `test`, `spec` | `test:` | `test: add user auth tests` |
| `docs`, `README`, `.md` | `docs:` | `docs: update API guide` |
| `refactor`, `rename` | `refactor:` | `refactor: extract helpers` |
| `style`, `css`, `ui` | `style:` | `style: update button colors` |
| `config`, `deps` | `chore:` | `chore: update dependencies` |
| Default | `feat:` | `feat: add login page` |

```bash
# Generate message if not provided
if [ -z "$COMMIT_MSG" ]; then
  TYPE="feat"
  
  if git diff --cached --name-only | grep -qE "(test|spec)\.(ts|tsx|js|jsx)$"; then
    TYPE="test"
  elif git diff --cached --name-only | grep -qE "^docs/|\.md$|README"; then
    TYPE="docs"
  elif git diff --cached | grep -qiE "fix|bug|error|catch.*exception"; then
    TYPE="fix"
  elif git diff --cached | grep -qiE "refactor|rename|move.*to"; then
    TYPE="refactor"
  elif git diff --cached --name-only | grep -qE "(css|scss|style|tailwind)"; then
    TYPE="style"
  elif git diff --cached --name-only | grep -qE "package\.json|yarn\.lock|pnpm-lock|bun.lock|Cargo.lock|go.mod|Makefile"; then
    TYPE="chore"
  fi
  
  # Get primary file name for description
  FILE=$(git diff --cached --name-only | head -1 | xargs basename | sed 's/\.[^.]*$//')
  
  # Create descriptive message
  case $TYPE in
    fix)    COMMIT_MSG="${TYPE}: resolve issue in ${FILE}" ;;
    test)   COMMIT_MSG="${TYPE}: add tests for ${FILE}" ;;
    docs)   COMMIT_MSG="${TYPE}: update ${FILE}" ;;
    refactor) COMMIT_MSG="${TYPE}: improve ${FILE}" ;;
    style)  COMMIT_MSG="${TYPE}: update ${FILE}" ;;
    chore)  COMMIT_MSG="${TYPE}: update ${FILE}" ;;
    *)      COMMIT_MSG="${TYPE}: update ${FILE}" ;;
  esac
fi
```

// turbo
### 5. Commit
```bash
git commit -m "$COMMIT_MSG"
```

## Options

| Flag | Description |
|------|-------------|
| `--no-build` | Skip the build step |
| `--dry-run` | Preview commit without executing |
| `--type <type>` | Force commit type (feat, fix, docs, etc.) |
| `--push` | Push after commit |

## Examples

```
/commit                           # Build and auto-commit
/commit "Add user authentication" # Custom message
/commit --no-build                # Just commit, no build
/commit --type fix --push         # Mark as fix, build, commit, push
```
