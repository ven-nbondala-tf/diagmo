import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from './editorStore'

describe('editorStore', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor()
  })

  it('should have initial state', () => {
    const state = useEditorStore.getState()
    expect(state.nodes).toEqual([])
    expect(state.edges).toEqual([])
    expect(state.selectedNodes).toEqual([])
    expect(state.gridEnabled).toBe(true)
    expect(state.snapToGrid).toBe(true)
  })

  it('should add a node', () => {
    useEditorStore.getState().addNode('rectangle', { x: 100, y: 100 })
    const state = useEditorStore.getState()
    expect(state.nodes).toHaveLength(1)
    expect(state.nodes[0].data.type).toBe('rectangle')
    expect(state.nodes[0].position).toEqual({ x: 100, y: 100 })
  })

  it('should toggle grid', () => {
    expect(useEditorStore.getState().gridEnabled).toBe(true)
    useEditorStore.getState().toggleGrid()
    expect(useEditorStore.getState().gridEnabled).toBe(false)
    useEditorStore.getState().toggleGrid()
    expect(useEditorStore.getState().gridEnabled).toBe(true)
  })

  it('should toggle snap to grid', () => {
    expect(useEditorStore.getState().snapToGrid).toBe(true)
    useEditorStore.getState().toggleSnapToGrid()
    expect(useEditorStore.getState().snapToGrid).toBe(false)
  })

  it('should load diagram', () => {
    const nodes = [
      {
        id: '1',
        type: 'custom' as const,
        position: { x: 0, y: 0 },
        data: { label: 'Test', type: 'rectangle' as const, style: {} },
      },
    ]
    const edges = [
      { id: 'e1', source: '1', target: '2' },
    ]

    useEditorStore.getState().loadDiagram(nodes, edges)
    const state = useEditorStore.getState()
    expect(state.nodes).toEqual(nodes)
    expect(state.edges).toEqual(edges)
    expect(state.isDirty).toBe(false)
  })

  it('should track dirty state', () => {
    expect(useEditorStore.getState().isDirty).toBe(false)
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    expect(useEditorStore.getState().isDirty).toBe(true)
    useEditorStore.getState().setDirty(false)
    expect(useEditorStore.getState().isDirty).toBe(false)
  })

  it('should handle undo/redo', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    expect(useEditorStore.getState().nodes).toHaveLength(1)
    expect(useEditorStore.getState().past).toHaveLength(1)

    useEditorStore.getState().undo()
    expect(useEditorStore.getState().nodes).toHaveLength(0)
    expect(useEditorStore.getState().future).toHaveLength(1)

    useEditorStore.getState().redo()
    expect(useEditorStore.getState().nodes).toHaveLength(1)
  })
})
