# /fix - Bug Fix Workflow

Diagnose and fix bugs systematically.

## Usage

```
/fix Export produces empty files
/fix Reconnecting status always shows
/fix Template edges connect to wrong position
```

## Process

1. **Understand the bug**
   - What is expected behavior?
   - What is actual behavior?
   - Steps to reproduce?

2. **Locate the issue**
   - Search relevant files
   - Add logging if needed
   - Check browser console

3. **Identify root cause**
   - Trace data flow
   - Check state management
   - Review recent changes

4. **Implement fix**
   - Minimal change to fix
   - No side effects
   - Add regression test

5. **Verify fix**
   - Manual testing
   - Run test suite
   - Check edge cases

6. **Update CLAUDE.md**
   - Remove from Known Issues
   - Document fix pattern if useful

## Known Issues Reference

Check `.claude/CLAUDE.md` section "Known Issues & Technical Debt" for:
- Critical issues
- High priority issues
- Medium priority issues

## Quick Fixes

### Export Empty Files
```typescript
// In exportService.ts - use correct selector
const viewport = wrapper.querySelector('.react-flow__viewport')
```

### Reconnecting Status
```typescript
// In collaborationStore.ts - change initial state
connectionStatus: 'connecting'  // not 'disconnected'
```

### Template Edge Handles
```typescript
// In templates.ts - add handles to edges
{ sourceHandle: 'right', targetHandle: 'left' }
```

## Delegation

After analysis, may delegate to:
- `@bug-fixer` for complex debugging
- `@tdd-guide` for test-first fix approach
