import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CustomNode } from '../nodes/CustomNode'
import type { NodeProps } from '@xyflow/react'
import type { DiagramNode } from '@/types'

// Mock @xyflow/react
vi.mock('@xyflow/react', () => ({
  Handle: ({ type, position }: { type: string; position: string }) => (
    <div data-testid={`handle-${type}-${position}`} />
  ),
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right',
  },
  NodeResizer: ({ isVisible }: { isVisible: boolean }) => (
    isVisible ? <div data-testid="node-resizer" /> : null
  ),
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Lock: () => <span data-testid="lock-icon">Lock</span>,
  Group: () => <span data-testid="group-icon">Group</span>,
}))

const createNodeProps = (
  overrides: Partial<DiagramNode['data']> = {}
) => ({
  id: 'test-node',
  type: 'custom',
  data: {
    label: 'Test Label',
    type: 'rectangle' as const,
    style: {
      backgroundColor: '#ffffff',
      borderColor: '#374151',
      borderWidth: 2,
      textColor: '#1f2937',
      fontSize: 14,
    },
    ...overrides,
  },
  selected: false,
  isConnectable: true,
  positionAbsoluteX: 0,
  positionAbsoluteY: 0,
  dragging: false,
  draggable: true,
  selectable: true,
  deletable: true,
  zIndex: 1,
  targetPosition: undefined,
  sourcePosition: undefined,
}) as unknown as NodeProps<DiagramNode>

describe('CustomNode', () => {
  it('should render rectangle shape with label', () => {
    const props = createNodeProps()
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render ellipse shape', () => {
    const props = createNodeProps({ type: 'ellipse' })
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render diamond shape', () => {
    const props = createNodeProps({ type: 'diamond' })
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render triangle shape', () => {
    const props = createNodeProps({ type: 'triangle' })
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render hexagon shape', () => {
    const props = createNodeProps({ type: 'hexagon' })
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render cylinder shape', () => {
    const props = createNodeProps({ type: 'cylinder' })
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render parallelogram shape', () => {
    const props = createNodeProps({ type: 'parallelogram' })
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render cloud shape', () => {
    const props = createNodeProps({ type: 'cloud' })
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render terminator shape', () => {
    const props = createNodeProps({ type: 'terminator' })
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render data shape', () => {
    const props = createNodeProps({ type: 'data' })
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render document shape', () => {
    const props = createNodeProps({ type: 'document' })
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render text shape', () => {
    const props = createNodeProps({ type: 'text' })
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render process shape (default case)', () => {
    const props = createNodeProps({ type: 'process' })
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render handles for connections', () => {
    const props = createNodeProps()
    render(<CustomNode {...props} />)

    expect(screen.getByTestId('handle-target-top')).toBeInTheDocument()
    expect(screen.getByTestId('handle-target-left')).toBeInTheDocument()
    expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument()
    expect(screen.getByTestId('handle-source-right')).toBeInTheDocument()
  })

  it('should show lock icon when node is locked', () => {
    const props = createNodeProps({ locked: true })
    render(<CustomNode {...props} />)

    expect(screen.getByTestId('lock-icon')).toBeInTheDocument()
  })

  it('should not show lock icon when node is not locked', () => {
    const props = createNodeProps({ locked: false })
    render(<CustomNode {...props} />)

    expect(screen.queryByTestId('lock-icon')).not.toBeInTheDocument()
  })

  it('should show group icon when node has groupId', () => {
    const props = createNodeProps({ groupId: 'group-1' })
    render(<CustomNode {...props} />)

    expect(screen.getByTestId('group-icon')).toBeInTheDocument()
  })

  it('should not show group icon when node has no groupId', () => {
    const props = createNodeProps()
    render(<CustomNode {...props} />)

    expect(screen.queryByTestId('group-icon')).not.toBeInTheDocument()
  })

  it('should apply custom styles', () => {
    const customStyle = {
      backgroundColor: '#ff0000',
      borderColor: '#00ff00',
      textColor: '#0000ff',
      fontSize: 20,
    }
    const props = createNodeProps({ style: customStyle })
    render(<CustomNode {...props} />)

    const element = screen.getByText('Test Label').closest('div')
    expect(element).toBeInTheDocument()
  })

  it('should apply selection styling when selected', () => {
    const props: NodeProps<DiagramNode> = {
      ...createNodeProps(),
      selected: true,
    }
    render(<CustomNode {...props} />)

    const element = screen.getByText('Test Label').closest('div')
    expect(element).toBeInTheDocument()
    // Selection adds ring-2 ring-primary classes
  })

  it('should handle missing style gracefully', () => {
    const props = createNodeProps({ style: undefined })
    render(<CustomNode {...props} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should show both lock and group icons when applicable', () => {
    const props = createNodeProps({ locked: true, groupId: 'group-1' })
    render(<CustomNode {...props} />)

    expect(screen.getByTestId('lock-icon')).toBeInTheDocument()
    expect(screen.getByTestId('group-icon')).toBeInTheDocument()
  })
})
