# /plan - Implementation Planning

Create a detailed implementation plan for a feature or change.

## Usage

```
/plan Add PDF export with page size options
/plan Implement keyboard navigation for canvas
/plan Fix the reconnecting status bug
```

## Process

1. **Analyze the request**
   - What is being asked?
   - What components are affected?
   - What are the dependencies?

2. **Research existing code**
   - Search for similar patterns
   - Check related files
   - Review the CLAUDE.md for conventions

3. **Create the plan**
   - Break into atomic tasks
   - Estimate complexity
   - Define testing strategy
   - Consider edge cases

## Output

Produce a markdown plan with:
- Overview
- Affected files list
- Implementation steps (ordered)
- Edge cases
- Testing strategy
- Rollback plan

## Delegation

After creating the plan, delegate to:
- `@planner` for complex features
- `@bug-fixer` for bug fixes
- `@tdd-guide` for test-first approach

## Example

```markdown
# Plan: Add PDF Export with Page Size

## Overview
Add ability to export diagrams to PDF with configurable page sizes.

## Affected Files
- [ ] `src/services/exportService.ts` - Add PDF options
- [ ] `src/components/editor/dialogs/ExportDialog.tsx` - Add size picker
- [ ] `src/types/export.ts` - Add PageSize type

## Steps
1. Add PageSize type (S)
2. Update exportService.exportToPdf (M)
3. Create PageSizeSelector component (M)
4. Update ExportDialog (S)
5. Add tests (M)

## Edge Cases
- Very large diagrams may need multiple pages
- Landscape vs portrait auto-detection

## Testing
- Unit: exportService with different sizes
- E2E: Full export flow
```
