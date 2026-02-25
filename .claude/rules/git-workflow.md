# Git Workflow Rules

## Branch Naming

```
feature/add-pdf-export
feature/implement-grouping
fix/reconnecting-status
fix/export-empty-files
refactor/split-shape-panel
docs/update-readme
test/add-editor-tests
chore/upgrade-dependencies
```

## Commit Messages

### Format
```
<type>: <short description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructure (no behavior change)
- `docs`: Documentation only
- `test`: Adding/updating tests
- `chore`: Build, deps, configs
- `style`: Formatting (no code change)
- `perf`: Performance improvement

### Examples
```
feat: add PDF export with page size options

- Added PageSize enum with A4, Letter, Legal options
- Updated ExportDialog with size selector
- Added unit tests for new functionality

Closes #123

---

fix: resolve reconnecting status always showing

Changed initial connection status from 'disconnected'
to 'connecting' to prevent false warning display.

---

refactor: split ShapePanel into category components

Extracted BasicShapes, FlowchartShapes, CloudShapes
to improve code organization and enable lazy loading.
```

## PR Process

### 1. Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature
```

### 2. Make Changes
- Write code following standards
- Add/update tests
- Update CLAUDE.md if needed

### 3. Pre-PR Checks
```bash
# Run all checks
npm run lint
npm run type-check
npm run test

# Fix any issues before PR
```

### 4. Create PR

**Title**: Same as commit format
```
feat: add PDF export with page size options
```

**Description Template**:
```markdown
## Summary
Brief description of changes

## Changes
- Change 1
- Change 2

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing done

## Screenshots (if UI changes)
[screenshots here]

## Related Issues
Closes #123
```

### 5. Review Process
- Request review from team member
- Address feedback
- Get approval

### 6. Merge
- Squash and merge to main
- Delete feature branch

## Quick Commands

```bash
# Create branch
git checkout -b feature/name

# Stage all changes
git add .

# Commit with message
git commit -m "feat: description"

# Push branch
git push -u origin feature/name

# Update from main
git fetch origin
git rebase origin/main

# Interactive rebase (clean commits)
git rebase -i HEAD~3
```

## Protected Branches

### main
- No direct pushes
- Requires PR with approval
- Must pass CI checks
- Squash merge only

## CI Checks

Every PR must pass:
1. TypeScript compilation
2. ESLint
3. Unit tests
4. Build succeeds
