# DIAGMO Code Review - Comprehensive Analysis

## ✅ WHAT'S WORKING WELL

| Feature | Status | Notes |
|---------|--------|-------|
| 8-point connection handles | ✅ Good | Draw.io style connections |
| Connection feedback (green highlight) | ✅ Good | Shows valid target |
| NodeResizer with 8 handles | ✅ Good | `keepAspectRatio={false}` set correctly |
| Smaller default arrows (12px) | ✅ Good | Down from 20px |
| Properties Panel structure | ✅ Good | Well organized with accordions |
| Enhanced NodeStyle types | ✅ Good | Shadow, rotation, fonts all defined |
| Keyboard shortcuts | ✅ Good | Comprehensive coverage |

---

## 🔴 ISSUES FOUND

### Issue 1: Shapes Not Applying All Style Properties

Many shapes in `CustomNode.tsx` don't use all the `baseStyle` properties correctly. For example:

**Problem:** The `borderStyle` property is always overridden with `'solid'`:
```tsx
// Line 125 - This overrides user's border style selection
style={{ ...baseStyle, borderStyle: 'solid' }}
```

**Also:** `borderRadius` is hardcoded for many shapes instead of using `style?.borderRadius`.

---

### Issue 2: Rotation Not Applied to Shapes

**Problem:** The rotation transform is in `baseStyle` but many shapes override or ignore it:
```tsx
// baseStyle has transform: style?.rotation ? `rotate(${style.rotation}deg)` : undefined
// But clip-path shapes ignore this because they use their own transforms
```

**Example:** The parallelogram uses `transform: 'skewX(-15deg)'` which overwrites rotation.

---

### Issue 3: Shadow Applied Incorrectly

**Problem:** `boxShadow` is applied but `clip-path` shapes clip the shadow:
```tsx
// Shapes with clip-path (triangle, star, pentagon, etc.) 
// will have their shadows clipped/cut off
```

---

### Issue 4: Border Style "None" Not Working

**Problem:** When user selects "none" for border style, shapes still show borders because `borderStyle: 'solid'` is hardcoded.

---

### Issue 5: Vertical Alignment Only Partially Implemented

**Problem:** The `verticalAlign` class is computed but text label rendering doesn't use it consistently for all shapes.

---

### Issue 6: Missing Visual Feedback for Some States

**Problem:** No visual indication when:
- Shape is being dragged
- Multiple shapes selected
- Connection in progress (only target shows green, source should show something)

---

## 🛠️ COMPREHENSIVE FIX PROMPT

Copy this entire section to Claude Code:

---

## TASK 1: Fix Shape Style Application

Update the `renderShape()` function in `CustomNode.tsx` to properly apply all styles:

```tsx
const renderShape = () => {
  // Build complete style object that respects user settings
  const getShapeStyle = (overrides: Record<string, unknown> = {}) => ({
    backgroundColor: baseStyle.backgroundColor,
    borderColor: baseStyle.borderColor,
    borderWidth: baseStyle.borderWidth,
    borderStyle: baseStyle.borderStyle, // Use user's choice, not hardcoded
    borderRadius: style?.borderRadius ?? 8,
    color: baseStyle.color,
    fontSize: baseStyle.fontSize,
    fontFamily: baseStyle.fontFamily,
    fontWeight: baseStyle.fontWeight,
    fontStyle: baseStyle.fontStyle,
    textDecoration: baseStyle.textDecoration,
    textAlign: baseStyle.textAlign,
    opacity: baseStyle.opacity,
    boxShadow: baseStyle.boxShadow,
    ...overrides,
  })

  // For clip-path shapes, wrap in container to preserve shadow
  const ClipPathWrapper = ({ children, clipPath }: { children: React.ReactNode; clipPath: string }) => (
    <div 
      className="w-full h-full"
      style={{
        filter: style?.shadowEnabled ? `drop-shadow(${style.shadowOffsetX || 4}px ${style.shadowOffsetY || 4}px ${style.shadowBlur || 10}px ${style.shadowColor || 'rgba(0,0,0,0.2)'})` : undefined,
        transform: style?.rotation ? `rotate(${style.rotation}deg)` : undefined,
      }}
    >
      <div
        className={shapeClass}
        style={{
          ...getShapeStyle({ boxShadow: 'none' }), // Don't apply box-shadow inside clip-path
          clipPath,
        }}
      >
        {children}
      </div>
    </div>
  )

  // Common shape class with vertical alignment
  const shapeClass = cn(
    'w-full h-full flex justify-center text-center overflow-hidden transition-all duration-150',
    getVerticalAlignClass(),
    locked && 'opacity-75',
    isTarget && 'ring-2 ring-green-500 ring-offset-2'
  )

  switch (type) {
    // ===== BASIC SHAPES (no clip-path, can use box-shadow directly) =====
    
    case 'rectangle':
    case 'process':
      return (
        <div
          className={cn(shapeClass, 'px-4 py-2')}
          style={getShapeStyle()}
        >
          {label}
        </div>
      )

    case 'rounded-rectangle':
      return (
        <div
          className={cn(shapeClass, 'px-4 py-2')}
          style={getShapeStyle({ borderRadius: style?.borderRadius ?? 16 })}
        >
          {label}
        </div>
      )

    case 'ellipse':
      return (
        <div
          className={cn(shapeClass, 'rounded-full px-4 py-2')}
          style={getShapeStyle({ borderRadius: '50%' })}
        >
          {label}
        </div>
      )

    case 'circle':
      return (
        <div
          className={cn(shapeClass, 'rounded-full px-2 py-2 aspect-square')}
          style={getShapeStyle({ borderRadius: '50%' })}
        >
          {label}
        </div>
      )

    // ===== CLIP-PATH SHAPES (use filter drop-shadow instead of box-shadow) =====

    case 'triangle':
      return (
        <ClipPathWrapper clipPath="polygon(50% 0%, 0% 100%, 100% 100%)">
          <span className="mt-[30%]">{label}</span>
        </ClipPathWrapper>
      )

    case 'diamond':
    case 'decision':
      return (
        <div 
          className="relative w-full h-full"
          style={{
            filter: style?.shadowEnabled ? `drop-shadow(${style.shadowOffsetX || 4}px ${style.shadowOffsetY || 4}px ${style.shadowBlur || 10}px ${style.shadowColor || 'rgba(0,0,0,0.2)'})` : undefined,
            transform: style?.rotation ? `rotate(${style.rotation}deg)` : undefined,
          }}
        >
          <div
            className={cn('absolute inset-[10%] rotate-45', locked && 'opacity-75')}
            style={getShapeStyle({ borderRadius: style?.borderRadius || 4, boxShadow: 'none' })}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: baseStyle.color, fontSize: baseStyle.fontSize }}
          >
            {label}
          </div>
        </div>
      )

    case 'pentagon':
      return (
        <ClipPathWrapper clipPath="polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)">
          {label}
        </ClipPathWrapper>
      )

    case 'hexagon':
    case 'preparation':
      return (
        <ClipPathWrapper clipPath="polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)">
          {label}
        </ClipPathWrapper>
      )

    case 'octagon':
      return (
        <ClipPathWrapper clipPath="polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)">
          {label}
        </ClipPathWrapper>
      )

    case 'star':
      return (
        <ClipPathWrapper clipPath="polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)">
          {label}
        </ClipPathWrapper>
      )

    case 'arrow':
      return (
        <ClipPathWrapper clipPath="polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)">
          {label}
        </ClipPathWrapper>
      )

    case 'double-arrow':
      return (
        <ClipPathWrapper clipPath="polygon(0% 50%, 15% 0%, 15% 25%, 85% 25%, 85% 0%, 100% 50%, 85% 100%, 85% 75%, 15% 75%, 15% 100%)">
          {label}
        </ClipPathWrapper>
      )

    case 'trapezoid':
      return (
        <ClipPathWrapper clipPath="polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)">
          {label}
        </ClipPathWrapper>
      )

    case 'callout':
      return (
        <ClipPathWrapper clipPath="polygon(0% 0%, 100% 0%, 100% 75%, 25% 75%, 10% 100%, 20% 75%, 0% 75%)">
          <span className="mb-[10%]">{label}</span>
        </ClipPathWrapper>
      )

    case 'merge':
      return (
        <ClipPathWrapper clipPath="polygon(0% 0%, 100% 0%, 50% 100%)">
          <span className="mb-[20%]">{label}</span>
        </ClipPathWrapper>
      )

    case 'note':
    case 'uml-note':
      return (
        <ClipPathWrapper clipPath="polygon(0% 0%, 85% 0%, 100% 15%, 100% 100%, 0% 100%)">
          {label}
        </ClipPathWrapper>
      )

    case 'document':
      return (
        <ClipPathWrapper clipPath="polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)">
          {label}
        </ClipPathWrapper>
      )

    case 'manual-input':
      return (
        <ClipPathWrapper clipPath="polygon(0% 20%, 100% 0%, 100% 100%, 0% 100%)">
          <span className="mt-[10%]">{label}</span>
        </ClipPathWrapper>
      )

    // ===== SPECIAL SHAPES (complex rendering) =====

    case 'parallelogram':
    case 'data':
      return (
        <div
          className="w-full h-full"
          style={{
            filter: style?.shadowEnabled ? `drop-shadow(${style.shadowOffsetX || 4}px ${style.shadowOffsetY || 4}px ${style.shadowBlur || 10}px ${style.shadowColor || 'rgba(0,0,0,0.2)'})` : undefined,
          }}
        >
          <div
            className={cn(shapeClass, 'px-6 py-2')}
            style={{
              ...getShapeStyle({ boxShadow: 'none' }),
              transform: `skewX(-15deg)${style?.rotation ? ` rotate(${style.rotation}deg)` : ''}`,
            }}
          >
            <span style={{ transform: 'skewX(15deg)' }}>{label}</span>
          </div>
        </div>
      )

    case 'cylinder':
    case 'database':
      return (
        <div
          className={cn(shapeClass, 'px-4 py-6')}
          style={getShapeStyle({ borderRadius: '10px 10px 50% 50% / 10px 10px 20px 20px' })}
        >
          {label}
        </div>
      )

    case 'cloud':
      return (
        <div
          className={cn(shapeClass, 'px-4 py-2')}
          style={getShapeStyle({ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' })}
        >
          {label}
        </div>
      )

    case 'terminator':
      return (
        <div
          className={cn(shapeClass, 'rounded-full px-6 py-2')}
          style={getShapeStyle({ borderRadius: 9999 })}
        >
          {label}
        </div>
      )

    case 'delay':
      return (
        <div
          className={cn(shapeClass, 'px-4 py-2')}
          style={getShapeStyle({ borderRadius: '0 50% 50% 0' })}
        >
          {label}
        </div>
      )

    // ... continue with remaining shapes following the same pattern
    
    default:
      return (
        <div
          className={cn(shapeClass, 'px-4 py-2')}
          style={getShapeStyle()}
        >
          {label}
        </div>
      )
  }
}
```

---

## TASK 2: Add Visual Feedback for Dragging

Add CSS styles for drag state in `src/styles/index.css`:

```css
/* Node being dragged */
.react-flow__node.dragging {
  opacity: 0.8;
  cursor: grabbing !important;
  z-index: 1000 !important;
}

.react-flow__node.dragging > div {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

/* Multi-selection indicator */
.react-flow__node.selected:not(:only-child) {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Source node during connection */
.react-flow__node.connecting {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Improved handle hover */
.react-flow__handle:hover {
  transform: scale(1.3);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
}

/* Edge hover effect */
.react-flow__edge:hover .react-flow__edge-path {
  stroke-width: 3;
  filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.5));
}

/* Selected edge */
.react-flow__edge.selected .react-flow__edge-path {
  stroke: #3b82f6;
  stroke-width: 2.5;
}
```

---

## TASK 3: Fix PropertiesPanel Border Style Not Working

In `PropertiesPanel.tsx`, ensure the border style buttons update correctly:

```tsx
{/* Border Style - Current code is good but verify it's in the panel */}
<div className="space-y-2">
  <Label className="text-xs font-medium">Border Style</Label>
  <div className="grid grid-cols-4 gap-1">
    {[
      { value: 'solid', label: '━' },
      { value: 'dashed', label: '┄' },
      { value: 'dotted', label: '┈' },
      { value: 'none', label: '○' },
    ].map((s) => (
      <Button
        key={s.value}
        variant={(style.borderStyle || 'solid') === s.value ? 'default' : 'outline'}
        size="sm"
        className="h-7 text-xs font-mono"
        onClick={() => updateNodeStyle(selectedNode.id, { 
          borderStyle: s.value as 'solid' | 'dashed' | 'dotted' | 'none',
          // When "none", also set borderWidth to 0
          ...(s.value === 'none' ? { borderWidth: 0 } : {})
        })}
      >
        {s.label}
      </Button>
    ))}
  </div>
</div>
```

---

## TASK 4: Improve UML Class Shape

The UML Class shape should be editable:

```tsx
case 'uml-class':
  return (
    <div
      className={cn('w-full h-full flex flex-col', locked && 'opacity-75')}
      style={{
        ...getShapeStyle({ borderRadius: 4 }),
        transform: style?.rotation ? `rotate(${style.rotation}deg)` : undefined,
      }}
    >
      <div 
        className="border-b px-2 py-1 font-bold text-center" 
        style={{ borderColor: baseStyle.borderColor }}
      >
        {label || 'ClassName'}
      </div>
      <div 
        className="flex-1 border-b px-2 py-1 text-xs text-left" 
        style={{ borderColor: baseStyle.borderColor, color: baseStyle.color }}
      >
        <div>+ attribute: Type</div>
        <div>- privateAttr: Type</div>
      </div>
      <div 
        className="flex-1 px-2 py-1 text-xs text-left"
        style={{ color: baseStyle.color }}
      >
        <div>+ method(): void</div>
        <div>- privateMethod()</div>
      </div>
    </div>
  )
```

---

## TASK 5: Add Missing Network Shapes

Complete the network shapes (router, switch, firewall) with better icons instead of emojis:

```tsx
case 'server':
  return (
    <div
      className={cn('w-full h-full flex flex-col', locked && 'opacity-75')}
      style={getShapeStyle({ borderRadius: 4 })}
    >
      {[0, 1, 2].map((i) => (
        <div 
          key={i}
          className={cn('flex-1 flex items-center px-2', i < 2 && 'border-b')}
          style={{ borderColor: baseStyle.borderColor }}
        >
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          </div>
          {i === 1 && <span className="ml-auto text-xs">{label}</span>}
        </div>
      ))}
    </div>
  )

case 'router':
  return (
    <div
      className={cn(shapeClass, 'px-2 py-2')}
      style={getShapeStyle({ borderRadius: 8 })}
    >
      <div className="flex flex-col items-center">
        <div className="flex gap-1 mb-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1 h-3 rounded-full" style={{ backgroundColor: baseStyle.borderColor }} />
          ))}
        </div>
        <div className="w-full h-6 rounded" style={{ backgroundColor: baseStyle.borderColor, opacity: 0.3 }} />
        <span className="text-xs mt-1">{label}</span>
      </div>
    </div>
  )

case 'firewall':
  return (
    <div
      className={cn(shapeClass, 'px-2 py-2')}
      style={getShapeStyle({ borderRadius: 4, borderColor: '#dc2626' })}
    >
      <div className="flex flex-col items-center">
        <div className="grid grid-cols-3 gap-0.5 mb-1">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-2 h-2" style={{ backgroundColor: i % 2 === 0 ? '#dc2626' : 'transparent' }} />
          ))}
        </div>
        <span className="text-xs">{label}</span>
      </div>
    </div>
  )
```

---

## TESTING CHECKLIST

After implementing fixes, verify:

### Shape Styles
- [ ] Rectangle respects border style (solid/dashed/dotted/none)
- [ ] Triangle shows shadow (using drop-shadow filter)
- [ ] Diamond rotation works correctly
- [ ] All clip-path shapes show proper shadows
- [ ] Border radius slider works on applicable shapes
- [ ] "None" border style hides the border completely

### Visual Feedback
- [ ] Dragging a shape shows elevated shadow
- [ ] Multiple selected shapes show outline
- [ ] Handle hover shows scale effect
- [ ] Edge hover shows highlight
- [ ] Selected edge is blue

### UX
- [ ] Double-click to edit text works
- [ ] Resize handles work from all 8 points
- [ ] Connection handles appear on hover
- [ ] Connection line is green dashed while dragging
- [ ] Target shape glows green when valid

---

## SUMMARY OF FIXES

| Issue | Fix |
|-------|-----|
| Border style hardcoded | Use `getShapeStyle()` helper function |
| Shadow clipped on clip-path shapes | Use CSS `filter: drop-shadow()` instead of `box-shadow` |
| Rotation not working on some shapes | Apply rotation via container wrapper |
| No drag visual feedback | Add CSS styles for `.dragging` state |
| UML shapes not customizable | Pass through user styles to UML shapes |
| Network shapes using emojis | Replace with CSS-based icons |
