import { Card, CardContent } from '@/components/ui'
import type { DiagramTemplate } from '@/constants/templates'
import { FileText, Cloud, GitBranch, Network, Box } from 'lucide-react'

const categoryIcons: Record<string, { icon: React.ElementType; color: string }> = {
  general: { icon: FileText, color: 'text-gray-500' },
  architecture: { icon: Cloud, color: 'text-blue-500' },
  flowchart: { icon: GitBranch, color: 'text-green-500' },
  network: { icon: Network, color: 'text-purple-500' },
  uml: { icon: Box, color: 'text-orange-500' },
}

interface TemplateQuickCardProps {
  template: DiagramTemplate
  onClick: () => void
}

export function TemplateQuickCard({ template, onClick }: TemplateQuickCardProps) {
  const { icon: Icon, color } = categoryIcons[template.category] || categoryIcons.general

  return (
    <Card
      className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
      onClick={onClick}
    >
      <CardContent className="p-4 text-center">
        <div className={`mx-auto mb-3 w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:scale-110 transition-transform ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-medium text-sm">{template.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
      </CardContent>
    </Card>
  )
}
