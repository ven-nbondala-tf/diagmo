# /update-claude - Update CLAUDE.md

Update the CLAUDE.md file when making changes to the project.

## Usage

```
/update-claude                    # Review and suggest updates
/update-claude feature <name>     # Add new feature to inventory
/update-claude bug <description>  # Add bug to known issues
/update-claude fixed <bug>        # Remove bug from known issues
/update-claude pattern <pattern>  # Add new coding pattern
```

## When to Update

**Always update CLAUDE.md when:**

1. **Adding new features**
   - Add to Feature Inventory section
   - Update Architecture if significant

2. **Creating new components/services/hooks**
   - Add to Project Structure
   - Add to Key Files Reference

3. **Fixing bugs**
   - Remove from Known Issues
   - Add to Change Log if significant

4. **Discovering patterns**
   - Add to Coding Standards
   - Add to Preferred Patterns

5. **Changing architecture**
   - Update Architecture Overview
   - Update component diagrams

## Sections to Update

### Feature Inventory
```markdown
### Core Diagramming
- [x] New feature name
```

### Known Issues
```markdown
### Critical (Must Fix)
1. **Issue name** - Description
```

### Change Log
```markdown
### v7.x (Date)
- Added: feature name
- Fixed: bug description
```

### Key Files Reference
```markdown
### New Category
- `src/path/to/file.ts` - Description
```

## Automation

This command should be run automatically when:
- A PR is merged
- A significant feature is completed
- A bug is fixed

## Output

After updating, show:
```markdown
# CLAUDE.md Updated

## Changes Made
- Added feature X to inventory
- Removed bug Y from known issues
- Updated architecture section

## Next Steps
- Commit the changes
- Push to repository
```
