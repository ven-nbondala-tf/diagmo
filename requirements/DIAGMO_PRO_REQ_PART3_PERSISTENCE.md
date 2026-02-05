# DIAGMO PRO - Requirements Document
## Part 3: Persistence, Dashboard, Export & Cloud Icons

---

## PHASE 3: PERSISTENCE (Week 5)

### Step 3.1: Diagram Service

**src/services/diagramService.ts:**
```typescript
import { supabase } from './supabase';
import { Diagram, DiagramData, Folder } from '@/types/diagram.types';

export const diagramService = {
  // Create new diagram
  async createDiagram(data: {
    name?: string;
    folderId?: string | null;
    diagramData?: DiagramData;
  }): Promise<Diagram> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: diagram, error } = await supabase
      .from('diagrams')
      .insert({
        user_id: user.id,
        name: data.name || 'Untitled Diagram',
        folder_id: data.folderId || null,
        data: data.diagramData || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
      })
      .select()
      .single();

    if (error) throw error;
    return diagram;
  },

  // Get all diagrams for current user
  async getDiagrams(folderId?: string | null): Promise<Diagram[]> {
    let query = supabase
      .from('diagrams')
      .select('*')
      .order('updated_at', { ascending: false });

    if (folderId === null) {
      query = query.is('folder_id', null);
    } else if (folderId) {
      query = query.eq('folder_id', folderId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get single diagram
  async getDiagram(id: string): Promise<Diagram> {
    const { data, error } = await supabase
      .from('diagrams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update diagram
  async updateDiagram(id: string, updates: Partial<Diagram>): Promise<Diagram> {
    const { data, error } = await supabase
      .from('diagrams')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Save diagram data (nodes, edges, viewport)
  async saveDiagramData(id: string, diagramData: DiagramData): Promise<void> {
    const { error } = await supabase
      .from('diagrams')
      .update({
        data: diagramData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Delete diagram
  async deleteDiagram(id: string): Promise<void> {
    const { error } = await supabase
      .from('diagrams')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Duplicate diagram
  async duplicateDiagram(id: string): Promise<Diagram> {
    const original = await this.getDiagram(id);
    
    return this.createDiagram({
      name: `${original.name} (Copy)`,
      folderId: original.folder_id,
      diagramData: original.data as DiagramData,
    });
  },
};

export const folderService = {
  // Create folder
  async createFolder(name: string, parentId?: string | null): Promise<Folder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name,
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get folders
  async getFolders(parentId?: string | null): Promise<Folder[]> {
    let query = supabase
      .from('folders')
      .select('*')
      .order('name');

    if (parentId === null) {
      query = query.is('parent_id', null);
    } else if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Update folder
  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
    const { data, error } = await supabase
      .from('folders')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete folder
  async deleteFolder(id: string): Promise<void> {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
```

### Step 3.2: React Query Hooks

**src/hooks/useDiagrams.ts:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { diagramService, folderService } from '@/services/diagramService';
import { Diagram, DiagramData, Folder } from '@/types/diagram.types';

// Diagrams
export const useDiagrams = (folderId?: string | null) => {
  return useQuery({
    queryKey: ['diagrams', folderId],
    queryFn: () => diagramService.getDiagrams(folderId),
  });
};

export const useDiagram = (id: string | undefined) => {
  return useQuery({
    queryKey: ['diagram', id],
    queryFn: () => diagramService.getDiagram(id!),
    enabled: !!id,
  });
};

export const useCreateDiagram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: diagramService.createDiagram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagrams'] });
    },
  });
};

export const useUpdateDiagram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Diagram> }) =>
      diagramService.updateDiagram(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['diagrams'] });
      queryClient.setQueryData(['diagram', data.id], data);
    },
  });
};

export const useSaveDiagramData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DiagramData }) =>
      diagramService.saveDiagramData(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['diagram', variables.id] });
    },
  });
};

export const useDeleteDiagram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: diagramService.deleteDiagram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagrams'] });
    },
  });
};

export const useDuplicateDiagram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: diagramService.duplicateDiagram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagrams'] });
    },
  });
};

// Folders
export const useFolders = (parentId?: string | null) => {
  return useQuery({
    queryKey: ['folders', parentId],
    queryFn: () => folderService.getFolders(parentId),
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, parentId }: { name: string; parentId?: string | null }) =>
      folderService.createFolder(name, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: folderService.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
};
```

### Step 3.3: Auto-Save Hook

**src/hooks/useAutoSave.ts:**
```typescript
import { useEffect, useRef, useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useSaveDiagramData } from './useDiagrams';
import { useReactFlow } from '@xyflow/react';

export const useAutoSave = (diagramId: string | null, interval = 30000) => {
  const { nodes, edges } = useDiagramStore();
  const { getViewport } = useReactFlow();
  const saveDiagram = useSaveDiagramData();
  const lastSavedRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const save = useCallback(async () => {
    if (!diagramId) return;

    const viewport = getViewport();
    const data = { nodes, edges, viewport };
    const dataString = JSON.stringify(data);

    // Only save if data has changed
    if (dataString !== lastSavedRef.current) {
      try {
        await saveDiagram.mutateAsync({ id: diagramId, data });
        lastSavedRef.current = dataString;
        console.log('Auto-saved diagram');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  }, [diagramId, nodes, edges, getViewport, saveDiagram]);

  // Auto-save on interval
  useEffect(() => {
    if (!diagramId) return;

    timeoutRef.current = setInterval(save, interval);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [diagramId, interval, save]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      save();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [save]);

  return { save, isSaving: saveDiagram.isPending };
};
```

### Step 3.4: Dashboard Page

**src/pages/DashboardPage.tsx:**
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder, FileText, MoreVertical, Trash2, Copy, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';
import { useDiagrams, useCreateDiagram, useDeleteDiagram, useDuplicateDiagram } from '@/hooks/useDiagrams';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { data: diagrams, isLoading } = useDiagrams(null);
  const createDiagram = useCreateDiagram();
  const deleteDiagram = useDeleteDiagram();
  const duplicateDiagram = useDuplicateDiagram();
  
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState('');

  const handleCreateDiagram = async () => {
    const diagram = await createDiagram.mutateAsync({
      name: newDiagramName || 'Untitled Diagram',
    });
    setShowNewDialog(false);
    setNewDiagramName('');
    navigate(`/editor/${diagram.id}`);
  };

  const handleOpenDiagram = (diagramId: string) => {
    navigate(`/editor/${diagramId}`);
  };

  const handleDeleteDiagram = async (diagramId: string) => {
    if (confirm('Are you sure you want to delete this diagram?')) {
      await deleteDiagram.mutateAsync(diagramId);
    }
  };

  const handleDuplicateDiagram = async (diagramId: string) => {
    await duplicateDiagram.mutateAsync(diagramId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Diagmo Pro</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Actions */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">My Diagrams</h2>
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Diagram
          </Button>
        </div>

        {/* Diagram Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : diagrams && diagrams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {diagrams.map((diagram) => (
              <div
                key={diagram.id}
                className="bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer group"
              >
                {/* Thumbnail */}
                <div
                  className="h-40 bg-gray-100 rounded-t-lg flex items-center justify-center"
                  onClick={() => handleOpenDiagram(diagram.id)}
                >
                  {diagram.thumbnail_url ? (
                    <img
                      src={diagram.thumbnail_url}
                      alt={diagram.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <FileText className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0" onClick={() => handleOpenDiagram(diagram.id)}>
                      <h3 className="font-medium text-gray-900 truncate">
                        {diagram.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Edited {formatDistanceToNow(new Date(diagram.updated_at))} ago
                      </p>
                    </div>
                    
                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDiagram(diagram.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateDiagram(diagram.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteDiagram(diagram.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No diagrams yet</h3>
            <p className="text-gray-500 mb-4">Create your first diagram to get started</p>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Diagram
            </Button>
          </div>
        )}
      </main>

      {/* New Diagram Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Diagram</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Diagram name"
              value={newDiagramName}
              onChange={(e) => setNewDiagramName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateDiagram()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDiagram} disabled={createDiagram.isPending}>
              {createDiagram.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

### Step 3.5: Phase 3 Checklist

- [ ] Diagram service functions work
- [ ] Can create new diagram from dashboard
- [ ] New diagram opens in editor
- [ ] Can save diagram (manual save)
- [ ] Auto-save works every 30 seconds
- [ ] Dashboard shows all diagrams
- [ ] Can open existing diagram
- [ ] Diagram loads with saved data
- [ ] Can delete diagram
- [ ] Can duplicate diagram
- [ ] Can rename diagram
- [ ] All tests pass

---

## PHASE 4: EXPORT FUNCTIONALITY (Week 6)

### Step 4.1: Export Hook

**src/hooks/useExport.ts:**
```typescript
import { useCallback } from 'react';
import { useReactFlow, getRectOfNodes } from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useDiagramStore } from '@/stores/diagramStore';

export const useExport = () => {
  const { getNodes, getViewport } = useReactFlow();
  const { diagramName } = useDiagramStore();

  const getExportFilename = (extension: string) => {
    const safeName = diagramName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${safeName}.${extension}`;
  };

  const exportToPng = useCallback(async (scale = 2) => {
    const nodes = getNodes();
    if (nodes.length === 0) {
      alert('No content to export');
      return;
    }

    const nodesBounds = getRectOfNodes(nodes);
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    
    if (!viewport) return;

    try {
      const padding = 50;
      const dataUrl = await toPng(viewport, {
        backgroundColor: '#ffffff',
        width: (nodesBounds.width + padding * 2) * scale,
        height: (nodesBounds.height + padding * 2) * scale,
        style: {
          width: `${nodesBounds.width + padding * 2}px`,
          height: `${nodesBounds.height + padding * 2}px`,
          transform: `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px) scale(${scale})`,
        },
      });

      const link = document.createElement('a');
      link.download = getExportFilename('png');
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export to PNG failed:', error);
      alert('Failed to export diagram');
    }
  }, [getNodes, diagramName]);

  const exportToSvg = useCallback(async () => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) return;

    try {
      const dataUrl = await toSvg(viewport, {
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = getExportFilename('svg');
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export to SVG failed:', error);
      alert('Failed to export diagram');
    }
  }, [diagramName]);

  const exportToPdf = useCallback(async () => {
    const nodes = getNodes();
    if (nodes.length === 0) {
      alert('No content to export');
      return;
    }

    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) return;

    try {
      const nodesBounds = getRectOfNodes(nodes);
      const padding = 50;
      
      const dataUrl = await toPng(viewport, {
        backgroundColor: '#ffffff',
        width: nodesBounds.width + padding * 2,
        height: nodesBounds.height + padding * 2,
        style: {
          width: `${nodesBounds.width + padding * 2}px`,
          height: `${nodesBounds.height + padding * 2}px`,
          transform: `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px)`,
        },
      });

      const pdf = new jsPDF({
        orientation: nodesBounds.width > nodesBounds.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [nodesBounds.width + padding * 2, nodesBounds.height + padding * 2],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, nodesBounds.width + padding * 2, nodesBounds.height + padding * 2);
      pdf.save(getExportFilename('pdf'));
    } catch (error) {
      console.error('Export to PDF failed:', error);
      alert('Failed to export diagram');
    }
  }, [getNodes, diagramName]);

  return { exportToPng, exportToSvg, exportToPdf };
};
```

---

## PHASE 5: CLOUD ICONS (Week 6-7)

### Step 5.1: Cloud Icons Constants

**src/constants/cloudIcons.ts:**
```typescript
export interface CloudIcon {
  id: string;
  name: string;
  provider: 'aws' | 'azure' | 'gcp';
  category: string;
  iconUrl: string;
}

// AWS Icons - Use official AWS Architecture Icons
// Download from: https://aws.amazon.com/architecture/icons/
export const awsIcons: CloudIcon[] = [
  // Compute
  { id: 'aws-ec2', name: 'EC2', provider: 'aws', category: 'Compute', iconUrl: '/icons/aws/Arch_Amazon-EC2_48.svg' },
  { id: 'aws-lambda', name: 'Lambda', provider: 'aws', category: 'Compute', iconUrl: '/icons/aws/Arch_AWS-Lambda_48.svg' },
  { id: 'aws-ecs', name: 'ECS', provider: 'aws', category: 'Compute', iconUrl: '/icons/aws/Arch_Amazon-Elastic-Container-Service_48.svg' },
  { id: 'aws-eks', name: 'EKS', provider: 'aws', category: 'Compute', iconUrl: '/icons/aws/Arch_Amazon-Elastic-Kubernetes-Service_48.svg' },
  { id: 'aws-fargate', name: 'Fargate', provider: 'aws', category: 'Compute', iconUrl: '/icons/aws/Arch_AWS-Fargate_48.svg' },
  
  // Storage
  { id: 'aws-s3', name: 'S3', provider: 'aws', category: 'Storage', iconUrl: '/icons/aws/Arch_Amazon-Simple-Storage-Service_48.svg' },
  { id: 'aws-ebs', name: 'EBS', provider: 'aws', category: 'Storage', iconUrl: '/icons/aws/Arch_Amazon-Elastic-Block-Store_48.svg' },
  { id: 'aws-efs', name: 'EFS', provider: 'aws', category: 'Storage', iconUrl: '/icons/aws/Arch_Amazon-Elastic-File-System_48.svg' },
  
  // Database
  { id: 'aws-rds', name: 'RDS', provider: 'aws', category: 'Database', iconUrl: '/icons/aws/Arch_Amazon-RDS_48.svg' },
  { id: 'aws-dynamodb', name: 'DynamoDB', provider: 'aws', category: 'Database', iconUrl: '/icons/aws/Arch_Amazon-DynamoDB_48.svg' },
  { id: 'aws-aurora', name: 'Aurora', provider: 'aws', category: 'Database', iconUrl: '/icons/aws/Arch_Amazon-Aurora_48.svg' },
  { id: 'aws-elasticache', name: 'ElastiCache', provider: 'aws', category: 'Database', iconUrl: '/icons/aws/Arch_Amazon-ElastiCache_48.svg' },
  
  // Networking
  { id: 'aws-vpc', name: 'VPC', provider: 'aws', category: 'Networking', iconUrl: '/icons/aws/Arch_Amazon-VPC_48.svg' },
  { id: 'aws-cloudfront', name: 'CloudFront', provider: 'aws', category: 'Networking', iconUrl: '/icons/aws/Arch_Amazon-CloudFront_48.svg' },
  { id: 'aws-route53', name: 'Route 53', provider: 'aws', category: 'Networking', iconUrl: '/icons/aws/Arch_Amazon-Route-53_48.svg' },
  { id: 'aws-alb', name: 'ALB', provider: 'aws', category: 'Networking', iconUrl: '/icons/aws/Arch_Elastic-Load-Balancing_48.svg' },
  { id: 'aws-api-gateway', name: 'API Gateway', provider: 'aws', category: 'Networking', iconUrl: '/icons/aws/Arch_Amazon-API-Gateway_48.svg' },
  
  // Security
  { id: 'aws-iam', name: 'IAM', provider: 'aws', category: 'Security', iconUrl: '/icons/aws/Arch_AWS-Identity-and-Access-Management_48.svg' },
  { id: 'aws-cognito', name: 'Cognito', provider: 'aws', category: 'Security', iconUrl: '/icons/aws/Arch_Amazon-Cognito_48.svg' },
  { id: 'aws-waf', name: 'WAF', provider: 'aws', category: 'Security', iconUrl: '/icons/aws/Arch_AWS-WAF_48.svg' },
  
  // Integration
  { id: 'aws-sqs', name: 'SQS', provider: 'aws', category: 'Integration', iconUrl: '/icons/aws/Arch_Amazon-Simple-Queue-Service_48.svg' },
  { id: 'aws-sns', name: 'SNS', provider: 'aws', category: 'Integration', iconUrl: '/icons/aws/Arch_Amazon-Simple-Notification-Service_48.svg' },
  { id: 'aws-eventbridge', name: 'EventBridge', provider: 'aws', category: 'Integration', iconUrl: '/icons/aws/Arch_Amazon-EventBridge_48.svg' },
  
  // Monitoring
  { id: 'aws-cloudwatch', name: 'CloudWatch', provider: 'aws', category: 'Monitoring', iconUrl: '/icons/aws/Arch_Amazon-CloudWatch_48.svg' },
];

// Azure Icons
export const azureIcons: CloudIcon[] = [
  { id: 'azure-vm', name: 'Virtual Machine', provider: 'azure', category: 'Compute', iconUrl: '/icons/azure/Virtual-Machine.svg' },
  { id: 'azure-functions', name: 'Functions', provider: 'azure', category: 'Compute', iconUrl: '/icons/azure/Function-Apps.svg' },
  { id: 'azure-aks', name: 'AKS', provider: 'azure', category: 'Compute', iconUrl: '/icons/azure/Kubernetes-Services.svg' },
  { id: 'azure-app-service', name: 'App Service', provider: 'azure', category: 'Compute', iconUrl: '/icons/azure/App-Services.svg' },
  
  { id: 'azure-blob', name: 'Blob Storage', provider: 'azure', category: 'Storage', iconUrl: '/icons/azure/Storage-Accounts.svg' },
  { id: 'azure-sql', name: 'SQL Database', provider: 'azure', category: 'Database', iconUrl: '/icons/azure/SQL-Database.svg' },
  { id: 'azure-cosmos', name: 'Cosmos DB', provider: 'azure', category: 'Database', iconUrl: '/icons/azure/Azure-Cosmos-DB.svg' },
  
  { id: 'azure-vnet', name: 'Virtual Network', provider: 'azure', category: 'Networking', iconUrl: '/icons/azure/Virtual-Networks.svg' },
  { id: 'azure-lb', name: 'Load Balancer', provider: 'azure', category: 'Networking', iconUrl: '/icons/azure/Load-Balancers.svg' },
  { id: 'azure-apim', name: 'API Management', provider: 'azure', category: 'Networking', iconUrl: '/icons/azure/API-Management-Services.svg' },
];

// GCP Icons
export const gcpIcons: CloudIcon[] = [
  { id: 'gcp-compute', name: 'Compute Engine', provider: 'gcp', category: 'Compute', iconUrl: '/icons/gcp/compute_engine.svg' },
  { id: 'gcp-functions', name: 'Cloud Functions', provider: 'gcp', category: 'Compute', iconUrl: '/icons/gcp/cloud_functions.svg' },
  { id: 'gcp-gke', name: 'GKE', provider: 'gcp', category: 'Compute', iconUrl: '/icons/gcp/kubernetes_engine.svg' },
  { id: 'gcp-run', name: 'Cloud Run', provider: 'gcp', category: 'Compute', iconUrl: '/icons/gcp/cloud_run.svg' },
  
  { id: 'gcp-storage', name: 'Cloud Storage', provider: 'gcp', category: 'Storage', iconUrl: '/icons/gcp/cloud_storage.svg' },
  { id: 'gcp-sql', name: 'Cloud SQL', provider: 'gcp', category: 'Database', iconUrl: '/icons/gcp/cloud_sql.svg' },
  { id: 'gcp-bigquery', name: 'BigQuery', provider: 'gcp', category: 'Database', iconUrl: '/icons/gcp/bigquery.svg' },
  { id: 'gcp-firestore', name: 'Firestore', provider: 'gcp', category: 'Database', iconUrl: '/icons/gcp/firestore.svg' },
  
  { id: 'gcp-vpc', name: 'VPC', provider: 'gcp', category: 'Networking', iconUrl: '/icons/gcp/virtual_private_cloud.svg' },
  { id: 'gcp-lb', name: 'Load Balancing', provider: 'gcp', category: 'Networking', iconUrl: '/icons/gcp/cloud_load_balancing.svg' },
];

// All icons combined
export const allCloudIcons = [...awsIcons, ...azureIcons, ...gcpIcons];

// Get icons by provider
export const getIconsByProvider = (provider: 'aws' | 'azure' | 'gcp') => {
  return allCloudIcons.filter((icon) => icon.provider === provider);
};

// Get icons by category
export const getIconsByCategory = (provider: 'aws' | 'azure' | 'gcp', category: string) => {
  return allCloudIcons.filter((icon) => icon.provider === provider && icon.category === category);
};

// Get unique categories for a provider
export const getCategoriesForProvider = (provider: 'aws' | 'azure' | 'gcp') => {
  const icons = getIconsByProvider(provider);
  return [...new Set(icons.map((icon) => icon.category))];
};
```

### Step 5.2: Cloud Icon Node Component

**src/components/editor/nodes/CloudIconNode.tsx:**
```typescript
import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';

interface CloudIconData {
  label: string;
  provider: 'aws' | 'azure' | 'gcp';
  service: string;
  iconUrl: string;
}

export const CloudIconNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as CloudIconData;
  const { label, iconUrl } = nodeData;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={48}
        minHeight={48}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'white',
          border: '2px solid #3b82f6',
        }}
      />

      {/* Handles */}
      <Handle type="target" position={Position.Top} id="top" className="!w-2 !h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Top} id="top-source" className="!w-2 !h-2 !bg-blue-500" />
      <Handle type="target" position={Position.Right} id="right" className="!w-2 !h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2 !h-2 !bg-blue-500" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="!w-2 !h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!w-2 !h-2 !bg-blue-500" />
      <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Left} id="left-source" className="!w-2 !h-2 !bg-blue-500" />

      {/* Icon */}
      <div className="flex flex-col items-center p-2 min-w-[64px]">
        <img 
          src={iconUrl} 
          alt={label}
          className="w-12 h-12"
          draggable={false}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/icons/placeholder.svg';
          }}
        />
        <span className="text-xs mt-1 text-center max-w-[80px] truncate">{label}</span>
      </div>
    </>
  );
});

CloudIconNode.displayName = 'CloudIconNode';
```

### Step 5.3: Phase 4-5 Checklist

- [ ] Export to PNG works
- [ ] Exported PNG has all shapes
- [ ] Exported PNG has good quality
- [ ] Export to SVG works
- [ ] Export to PDF works
- [ ] Cloud icons show in shape panel
- [ ] AWS icons organized by category
- [ ] Azure icons organized by category
- [ ] GCP icons organized by category
- [ ] Can drag cloud icon to canvas
- [ ] Cloud icon displays correctly
- [ ] Can connect cloud icons
- [ ] Can resize cloud icons
- [ ] All tests pass

---

*Continue to Part 4: Testing Strategy & Final Checklist →*
