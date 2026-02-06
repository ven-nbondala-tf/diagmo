// Import all renderer modules to trigger shape registration
import './BasicShapes'
import './SVGShapes'
import './SpecialShapes'
import './UMLShapes'
import './NetworkShapes'
import './ContainerShapes'
import './WebImageShape'
import './TextShape'
import './TableShape'
import './JunctionShape'
import './CustomShape'

// Re-export the cloud icon fallback renderer
export { renderCloudIconOrDefault } from './CloudIconShape'
