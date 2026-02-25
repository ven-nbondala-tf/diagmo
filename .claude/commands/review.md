# /review - Code Review

Perform a comprehensive code review on recent changes.

## Usage

```
/review                           # Review all uncommitted changes
/review src/services/            # Review specific directory
/review exportService.ts         # Review specific file
```

## Review Checklist

### Code Quality
- [ ] TypeScript types explicit (no `any`)
- [ ] Single responsibility principle
- [ ] No code duplication
- [ ] Clear naming conventions
- [ ] Proper error handling

### React Patterns
- [ ] Correct hook dependencies
- [ ] Memoization where needed
- [ ] Proper key props
- [ ] Error boundaries

### State Management
- [ ] Zustand selectors used
- [ ] No direct mutation
- [ ] History tracking for undo

### Security
- [ ] No hardcoded secrets
- [ ] Input validation
- [ ] XSS prevention

### Performance
- [ ] Lazy loading used
- [ ] No N+1 queries
- [ ] Large lists virtualized

### Testing
- [ ] Tests exist for new code
- [ ] Edge cases covered
- [ ] Mocks appropriate

## Output Format

```markdown
# Code Review Summary

## ✅ Approved / ⚠️ Changes Requested / ❌ Blocked

## Strengths
- Good use of TypeScript
- Proper error handling

## Issues

### 🔴 Critical
- **File:** `path/to/file.ts:42`
- **Issue:** Using any type
- **Fix:** Define proper interface

### 🟡 Suggestions
- Consider memoizing this computation

### 🟢 Nitpicks
- Prefer const over let here
```

## Delegation

For deeper review, delegate to:
- `@code-reviewer` for full analysis
