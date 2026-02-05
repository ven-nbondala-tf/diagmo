# DIAGMO PRO - Phase 2 Enhancement Prompt
## For Claude Code Implementation

Copy this entire prompt to Claude Code:

---

## OVERVIEW

The MVP is complete. Now implement these enhancements:

1. Fix shape resize functionality
2. Replace placeholder cloud icons with official icons
3. Collapse shape panel categories by default
4. Group and organize properties panel with scroll
5. Add more shapes
6. Add advanced features

---

## TASK 1: FIX SHAPE RESIZE

### Problem
Shapes cannot be resized by dragging handles.

### Solution
Ensure NodeResizer is properly configured for ALL node types.

**Update each node component (RectangleNode, EllipseNode, DiamondNode, etc.):**

```tsx
import { memo, useEffect } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';

export const RectangleNode = memo(({ id, data, selected }: NodeProps) => {
  return (
    <>
      {/* NodeResizer MUST be first child and visible when selected */}
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={40}
        handleStyle={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: 'white',
          border: '2px solid #3b82f6',
        }}
        lineStyle={{
          borderWidth: 1,
          borderColor: '#3b82f6',
        }}
      />
      
      {/* Rest of node content */}
      {/* ... handles and shape ... */}
    </>
  );
});
```

**IMPORTANT:** Make sure the node has explicit width/height in style or the parent div:

```tsx
// In Canvas.tsx, when adding node:
const newNode = {
  id: `node-${nanoid()}`,
  type,
  position,
  style: { width: 120, height: 80 }, // ADD THIS
  data: { ... },
};
```

### Test
- [ ] Select rectangle → 8 resize handles appear
- [ ] Drag corner handle → shape resizes
- [ ] Drag edge handle → shape resizes in one direction
- [ ] Minimum size is enforced (can't make too small)

---

## TASK 2: OFFICIAL CLOUD ICONS

### Problem
Current cloud icons are placeholders/generic, not official AWS/Azure/GCP icons.

### Solution

#### Step 2.1: Download Official Icons

**AWS Architecture Icons:**
1. Go to: https://aws.amazon.com/architecture/icons/
2. Download the "Asset Package"
3. Extract and copy SVG icons to: `public/icons/aws/`

**Azure Icons:**
1. Go to: https://learn.microsoft.com/en-us/azure/architecture/icons/
2. Download the icon set
3. Extract and copy SVG icons to: `public/icons/azure/`

**GCP Icons:**
1. Go to: https://cloud.google.com/icons
2. Download the icon set
3. Extract and copy SVG icons to: `public/icons/gcp/`

#### Step 2.2: Update Cloud Icons Constants

**src/constants/cloudIcons.ts:**

```typescript
export interface CloudIcon {
  id: string;
  name: string;
  category: string;
  iconPath: string;
}

export const awsIcons: Record<string, CloudIcon[]> = {
  Compute: [
    { id: 'aws-ec2', name: 'EC2', category: 'Compute', iconPath: '/icons/aws/Arch_Amazon-EC2_48.svg' },
    { id: 'aws-lambda', name: 'Lambda', category: 'Compute', iconPath: '/icons/aws/Arch_AWS-Lambda_48.svg' },
    { id: 'aws-ecs', name: 'ECS', category: 'Compute', iconPath: '/icons/aws/Arch_Amazon-ECS_48.svg' },
    { id: 'aws-eks', name: 'EKS', category: 'Compute', iconPath: '/icons/aws/Arch_Amazon-EKS_48.svg' },
    { id: 'aws-fargate', name: 'Fargate', category: 'Compute', iconPath: '/icons/aws/Arch_AWS-Fargate_48.svg' },
    { id: 'aws-lightsail', name: 'Lightsail', category: 'Compute', iconPath: '/icons/aws/Arch_Amazon-Lightsail_48.svg' },
    { id: 'aws-batch', name: 'Batch', category: 'Compute', iconPath: '/icons/aws/Arch_AWS-Batch_48.svg' },
  ],
  Storage: [
    { id: 'aws-s3', name: 'S3', category: 'Storage', iconPath: '/icons/aws/Arch_Amazon-S3_48.svg' },
    { id: 'aws-ebs', name: 'EBS', category: 'Storage', iconPath: '/icons/aws/Arch_Amazon-EBS_48.svg' },
    { id: 'aws-efs', name: 'EFS', category: 'Storage', iconPath: '/icons/aws/Arch_Amazon-EFS_48.svg' },
    { id: 'aws-glacier', name: 'Glacier', category: 'Storage', iconPath: '/icons/aws/Arch_Amazon-S3-Glacier_48.svg' },
    { id: 'aws-fsx', name: 'FSx', category: 'Storage', iconPath: '/icons/aws/Arch_Amazon-FSx_48.svg' },
  ],
  Database: [
    { id: 'aws-rds', name: 'RDS', category: 'Database', iconPath: '/icons/aws/Arch_Amazon-RDS_48.svg' },
    { id: 'aws-dynamodb', name: 'DynamoDB', category: 'Database', iconPath: '/icons/aws/Arch_Amazon-DynamoDB_48.svg' },
    { id: 'aws-aurora', name: 'Aurora', category: 'Database', iconPath: '/icons/aws/Arch_Amazon-Aurora_48.svg' },
    { id: 'aws-elasticache', name: 'ElastiCache', category: 'Database', iconPath: '/icons/aws/Arch_Amazon-ElastiCache_48.svg' },
    { id: 'aws-redshift', name: 'Redshift', category: 'Database', iconPath: '/icons/aws/Arch_Amazon-Redshift_48.svg' },
    { id: 'aws-neptune', name: 'Neptune', category: 'Database', iconPath: '/icons/aws/Arch_Amazon-Neptune_48.svg' },
    { id: 'aws-documentdb', name: 'DocumentDB', category: 'Database', iconPath: '/icons/aws/Arch_Amazon-DocumentDB_48.svg' },
  ],
  Networking: [
    { id: 'aws-vpc', name: 'VPC', category: 'Networking', iconPath: '/icons/aws/Arch_Amazon-VPC_48.svg' },
    { id: 'aws-cloudfront', name: 'CloudFront', category: 'Networking', iconPath: '/icons/aws/Arch_Amazon-CloudFront_48.svg' },
    { id: 'aws-route53', name: 'Route 53', category: 'Networking', iconPath: '/icons/aws/Arch_Amazon-Route-53_48.svg' },
    { id: 'aws-elb', name: 'ELB', category: 'Networking', iconPath: '/icons/aws/Arch_Elastic-Load-Balancing_48.svg' },
    { id: 'aws-apigateway', name: 'API Gateway', category: 'Networking', iconPath: '/icons/aws/Arch_Amazon-API-Gateway_48.svg' },
    { id: 'aws-directconnect', name: 'Direct Connect', category: 'Networking', iconPath: '/icons/aws/Arch_AWS-Direct-Connect_48.svg' },
  ],
  Security: [
    { id: 'aws-iam', name: 'IAM', category: 'Security', iconPath: '/icons/aws/Arch_AWS-IAM_48.svg' },
    { id: 'aws-cognito', name: 'Cognito', category: 'Security', iconPath: '/icons/aws/Arch_Amazon-Cognito_48.svg' },
    { id: 'aws-waf', name: 'WAF', category: 'Security', iconPath: '/icons/aws/Arch_AWS-WAF_48.svg' },
    { id: 'aws-kms', name: 'KMS', category: 'Security', iconPath: '/icons/aws/Arch_AWS-KMS_48.svg' },
    { id: 'aws-shield', name: 'Shield', category: 'Security', iconPath: '/icons/aws/Arch_AWS-Shield_48.svg' },
  ],
  'App Integration': [
    { id: 'aws-sqs', name: 'SQS', category: 'App Integration', iconPath: '/icons/aws/Arch_Amazon-SQS_48.svg' },
    { id: 'aws-sns', name: 'SNS', category: 'App Integration', iconPath: '/icons/aws/Arch_Amazon-SNS_48.svg' },
    { id: 'aws-eventbridge', name: 'EventBridge', category: 'App Integration', iconPath: '/icons/aws/Arch_Amazon-EventBridge_48.svg' },
    { id: 'aws-stepfunctions', name: 'Step Functions', category: 'App Integration', iconPath: '/icons/aws/Arch_AWS-Step-Functions_48.svg' },
    { id: 'aws-mq', name: 'MQ', category: 'App Integration', iconPath: '/icons/aws/Arch_Amazon-MQ_48.svg' },
  ],
  Analytics: [
    { id: 'aws-athena', name: 'Athena', category: 'Analytics', iconPath: '/icons/aws/Arch_Amazon-Athena_48.svg' },
    { id: 'aws-kinesis', name: 'Kinesis', category: 'Analytics', iconPath: '/icons/aws/Arch_Amazon-Kinesis_48.svg' },
    { id: 'aws-quicksight', name: 'QuickSight', category: 'Analytics', iconPath: '/icons/aws/Arch_Amazon-QuickSight_48.svg' },
    { id: 'aws-emr', name: 'EMR', category: 'Analytics', iconPath: '/icons/aws/Arch_Amazon-EMR_48.svg' },
    { id: 'aws-glue', name: 'Glue', category: 'Analytics', iconPath: '/icons/aws/Arch_AWS-Glue_48.svg' },
  ],
  'Machine Learning': [
    { id: 'aws-sagemaker', name: 'SageMaker', category: 'Machine Learning', iconPath: '/icons/aws/Arch_Amazon-SageMaker_48.svg' },
    { id: 'aws-rekognition', name: 'Rekognition', category: 'Machine Learning', iconPath: '/icons/aws/Arch_Amazon-Rekognition_48.svg' },
    { id: 'aws-comprehend', name: 'Comprehend', category: 'Machine Learning', iconPath: '/icons/aws/Arch_Amazon-Comprehend_48.svg' },
    { id: 'aws-lex', name: 'Lex', category: 'Machine Learning', iconPath: '/icons/aws/Arch_Amazon-Lex_48.svg' },
    { id: 'aws-bedrock', name: 'Bedrock', category: 'Machine Learning', iconPath: '/icons/aws/Arch_Amazon-Bedrock_48.svg' },
  ],
  Management: [
    { id: 'aws-cloudwatch', name: 'CloudWatch', category: 'Management', iconPath: '/icons/aws/Arch_Amazon-CloudWatch_48.svg' },
    { id: 'aws-cloudformation', name: 'CloudFormation', category: 'Management', iconPath: '/icons/aws/Arch_AWS-CloudFormation_48.svg' },
    { id: 'aws-cloudtrail', name: 'CloudTrail', category: 'Management', iconPath: '/icons/aws/Arch_AWS-CloudTrail_48.svg' },
    { id: 'aws-config', name: 'Config', category: 'Management', iconPath: '/icons/aws/Arch_AWS-Config_48.svg' },
    { id: 'aws-ssm', name: 'Systems Manager', category: 'Management', iconPath: '/icons/aws/Arch_AWS-Systems-Manager_48.svg' },
  ],
};

export const azureIcons: Record<string, CloudIcon[]> = {
  Compute: [
    { id: 'azure-vm', name: 'Virtual Machine', category: 'Compute', iconPath: '/icons/azure/Virtual-Machine.svg' },
    { id: 'azure-functions', name: 'Functions', category: 'Compute', iconPath: '/icons/azure/Function-Apps.svg' },
    { id: 'azure-aks', name: 'AKS', category: 'Compute', iconPath: '/icons/azure/Kubernetes-Services.svg' },
    { id: 'azure-appservice', name: 'App Service', category: 'Compute', iconPath: '/icons/azure/App-Services.svg' },
    { id: 'azure-container', name: 'Container Instances', category: 'Compute', iconPath: '/icons/azure/Container-Instances.svg' },
    { id: 'azure-batch', name: 'Batch', category: 'Compute', iconPath: '/icons/azure/Batch-Accounts.svg' },
  ],
  Storage: [
    { id: 'azure-storage', name: 'Storage Account', category: 'Storage', iconPath: '/icons/azure/Storage-Accounts.svg' },
    { id: 'azure-blob', name: 'Blob Storage', category: 'Storage', iconPath: '/icons/azure/Blob-Block.svg' },
    { id: 'azure-files', name: 'Files', category: 'Storage', iconPath: '/icons/azure/Storage-Files.svg' },
    { id: 'azure-disk', name: 'Managed Disks', category: 'Storage', iconPath: '/icons/azure/Disks.svg' },
  ],
  Database: [
    { id: 'azure-sql', name: 'SQL Database', category: 'Database', iconPath: '/icons/azure/SQL-Database.svg' },
    { id: 'azure-cosmos', name: 'Cosmos DB', category: 'Database', iconPath: '/icons/azure/Azure-Cosmos-DB.svg' },
    { id: 'azure-mysql', name: 'MySQL', category: 'Database', iconPath: '/icons/azure/Azure-Database-MySQL.svg' },
    { id: 'azure-postgresql', name: 'PostgreSQL', category: 'Database', iconPath: '/icons/azure/Azure-Database-PostgreSQL.svg' },
    { id: 'azure-redis', name: 'Redis Cache', category: 'Database', iconPath: '/icons/azure/Azure-Cache-Redis.svg' },
  ],
  Networking: [
    { id: 'azure-vnet', name: 'Virtual Network', category: 'Networking', iconPath: '/icons/azure/Virtual-Networks.svg' },
    { id: 'azure-lb', name: 'Load Balancer', category: 'Networking', iconPath: '/icons/azure/Load-Balancers.svg' },
    { id: 'azure-appgw', name: 'App Gateway', category: 'Networking', iconPath: '/icons/azure/Application-Gateways.svg' },
    { id: 'azure-cdn', name: 'CDN', category: 'Networking', iconPath: '/icons/azure/CDN-Profiles.svg' },
    { id: 'azure-dns', name: 'DNS', category: 'Networking', iconPath: '/icons/azure/DNS-Zones.svg' },
    { id: 'azure-frontdoor', name: 'Front Door', category: 'Networking', iconPath: '/icons/azure/Front-Doors.svg' },
  ],
  Security: [
    { id: 'azure-keyvault', name: 'Key Vault', category: 'Security', iconPath: '/icons/azure/Key-Vaults.svg' },
    { id: 'azure-ad', name: 'Entra ID', category: 'Security', iconPath: '/icons/azure/Entra-ID.svg' },
    { id: 'azure-defender', name: 'Defender', category: 'Security', iconPath: '/icons/azure/Microsoft-Defender.svg' },
    { id: 'azure-sentinel', name: 'Sentinel', category: 'Security', iconPath: '/icons/azure/Microsoft-Sentinel.svg' },
  ],
  Integration: [
    { id: 'azure-servicebus', name: 'Service Bus', category: 'Integration', iconPath: '/icons/azure/Service-Bus.svg' },
    { id: 'azure-eventgrid', name: 'Event Grid', category: 'Integration', iconPath: '/icons/azure/Event-Grid-Domains.svg' },
    { id: 'azure-eventhubs', name: 'Event Hubs', category: 'Integration', iconPath: '/icons/azure/Event-Hubs.svg' },
    { id: 'azure-logicapps', name: 'Logic Apps', category: 'Integration', iconPath: '/icons/azure/Logic-Apps.svg' },
    { id: 'azure-apim', name: 'API Management', category: 'Integration', iconPath: '/icons/azure/API-Management.svg' },
  ],
  AI: [
    { id: 'azure-openai', name: 'OpenAI', category: 'AI', iconPath: '/icons/azure/Azure-OpenAI.svg' },
    { id: 'azure-cognitiveservices', name: 'Cognitive Services', category: 'AI', iconPath: '/icons/azure/Cognitive-Services.svg' },
    { id: 'azure-ml', name: 'Machine Learning', category: 'AI', iconPath: '/icons/azure/Machine-Learning.svg' },
    { id: 'azure-botservice', name: 'Bot Service', category: 'AI', iconPath: '/icons/azure/Bot-Services.svg' },
  ],
};

export const gcpIcons: Record<string, CloudIcon[]> = {
  Compute: [
    { id: 'gcp-compute', name: 'Compute Engine', category: 'Compute', iconPath: '/icons/gcp/compute_engine.svg' },
    { id: 'gcp-functions', name: 'Cloud Functions', category: 'Compute', iconPath: '/icons/gcp/cloud_functions.svg' },
    { id: 'gcp-run', name: 'Cloud Run', category: 'Compute', iconPath: '/icons/gcp/cloud_run.svg' },
    { id: 'gcp-gke', name: 'GKE', category: 'Compute', iconPath: '/icons/gcp/google_kubernetes_engine.svg' },
    { id: 'gcp-appengine', name: 'App Engine', category: 'Compute', iconPath: '/icons/gcp/app_engine.svg' },
  ],
  Storage: [
    { id: 'gcp-storage', name: 'Cloud Storage', category: 'Storage', iconPath: '/icons/gcp/cloud_storage.svg' },
    { id: 'gcp-filestore', name: 'Filestore', category: 'Storage', iconPath: '/icons/gcp/filestore.svg' },
    { id: 'gcp-persistentdisk', name: 'Persistent Disk', category: 'Storage', iconPath: '/icons/gcp/persistent_disk.svg' },
  ],
  Database: [
    { id: 'gcp-sql', name: 'Cloud SQL', category: 'Database', iconPath: '/icons/gcp/cloud_sql.svg' },
    { id: 'gcp-spanner', name: 'Spanner', category: 'Database', iconPath: '/icons/gcp/cloud_spanner.svg' },
    { id: 'gcp-bigtable', name: 'Bigtable', category: 'Database', iconPath: '/icons/gcp/bigtable.svg' },
    { id: 'gcp-firestore', name: 'Firestore', category: 'Database', iconPath: '/icons/gcp/firestore.svg' },
    { id: 'gcp-memorystore', name: 'Memorystore', category: 'Database', iconPath: '/icons/gcp/memorystore.svg' },
  ],
  Networking: [
    { id: 'gcp-vpc', name: 'VPC', category: 'Networking', iconPath: '/icons/gcp/virtual_private_cloud.svg' },
    { id: 'gcp-lb', name: 'Load Balancing', category: 'Networking', iconPath: '/icons/gcp/cloud_load_balancing.svg' },
    { id: 'gcp-cdn', name: 'Cloud CDN', category: 'Networking', iconPath: '/icons/gcp/cloud_cdn.svg' },
    { id: 'gcp-dns', name: 'Cloud DNS', category: 'Networking', iconPath: '/icons/gcp/cloud_dns.svg' },
    { id: 'gcp-armor', name: 'Cloud Armor', category: 'Networking', iconPath: '/icons/gcp/cloud_armor.svg' },
  ],
  'Big Data': [
    { id: 'gcp-bigquery', name: 'BigQuery', category: 'Big Data', iconPath: '/icons/gcp/bigquery.svg' },
    { id: 'gcp-dataflow', name: 'Dataflow', category: 'Big Data', iconPath: '/icons/gcp/dataflow.svg' },
    { id: 'gcp-dataproc', name: 'Dataproc', category: 'Big Data', iconPath: '/icons/gcp/dataproc.svg' },
    { id: 'gcp-pubsub', name: 'Pub/Sub', category: 'Big Data', iconPath: '/icons/gcp/pubsub.svg' },
    { id: 'gcp-composer', name: 'Composer', category: 'Big Data', iconPath: '/icons/gcp/cloud_composer.svg' },
  ],
  AI: [
    { id: 'gcp-vertexai', name: 'Vertex AI', category: 'AI', iconPath: '/icons/gcp/vertex_ai.svg' },
    { id: 'gcp-aiplatform', name: 'AI Platform', category: 'AI', iconPath: '/icons/gcp/ai_platform.svg' },
    { id: 'gcp-vision', name: 'Vision AI', category: 'AI', iconPath: '/icons/gcp/cloud_vision_api.svg' },
    { id: 'gcp-speech', name: 'Speech-to-Text', category: 'AI', iconPath: '/icons/gcp/speech_to_text.svg' },
    { id: 'gcp-translate', name: 'Translation', category: 'AI', iconPath: '/icons/gcp/cloud_translation_api.svg' },
  ],
};
```

### Test
- [ ] AWS icons show official orange/yellow AWS styling
- [ ] Azure icons show official blue Azure styling
- [ ] GCP icons show official Google colors
- [ ] Icons are crisp and clear at all zoom levels

---

## TASK 3: COLLAPSE SHAPE PANEL CATEGORIES BY DEFAULT

### Problem
All categories are expanded, taking too much space.

### Solution

**Update ShapePanel.tsx:**

```tsx
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const ShapePanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // NO default expanded categories - all collapsed by default
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  return (
    <aside className="w-64 border-r bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm text-gray-700">Shapes</h2>
        <p className="text-xs text-gray-500">Drag or click to add</p>
      </div>

      {/* Search */}
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search shapes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Scrollable shape list */}
      <div className="flex-1 overflow-y-auto">
        <Accordion
          type="multiple"
          value={expandedCategories}
          onValueChange={setExpandedCategories}
          className="w-full"
        >
          {/* Basic Shapes - Collapsed by default */}
          <AccordionItem value="basic" className="border-b">
            <AccordionTrigger className="px-3 py-2 text-sm hover:bg-gray-50">
              Basic Shapes
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="grid grid-cols-3 gap-1 px-2">
                {/* Shape items */}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Flowchart - Collapsed by default */}
          <AccordionItem value="flowchart" className="border-b">
            <AccordionTrigger className="px-3 py-2 text-sm hover:bg-gray-50">
              Flowchart
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              {/* ... */}
            </AccordionContent>
          </AccordionItem>

          {/* UML - Collapsed by default */}
          <AccordionItem value="uml" className="border-b">
            <AccordionTrigger className="px-3 py-2 text-sm hover:bg-gray-50">
              UML
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              {/* ... */}
            </AccordionContent>
          </AccordionItem>

          {/* AWS with subcategories */}
          <AccordionItem value="aws" className="border-b">
            <AccordionTrigger className="px-3 py-2 text-sm hover:bg-gray-50">
              <span className="flex items-center gap-2">
                <img src="/icons/aws/AWS-Logo.svg" alt="AWS" className="w-4 h-4" />
                AWS
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              {/* Nested accordion for AWS categories */}
              <Accordion type="multiple" className="w-full">
                {Object.entries(awsIcons).map(([category, icons]) => (
                  <AccordionItem key={category} value={`aws-${category}`} className="border-0">
                    <AccordionTrigger className="px-4 py-1.5 text-xs hover:bg-gray-50">
                      {category} ({icons.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 gap-1 px-3">
                        {icons.map((icon) => (
                          <ShapeItem key={icon.id} icon={icon} />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>

          {/* Azure with subcategories */}
          <AccordionItem value="azure" className="border-b">
            <AccordionTrigger className="px-3 py-2 text-sm hover:bg-gray-50">
              <span className="flex items-center gap-2">
                <img src="/icons/azure/Azure-Logo.svg" alt="Azure" className="w-4 h-4" />
                Azure
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              {/* Same nested structure as AWS */}
            </AccordionContent>
          </AccordionItem>

          {/* GCP with subcategories */}
          <AccordionItem value="gcp" className="border-b">
            <AccordionTrigger className="px-3 py-2 text-sm hover:bg-gray-50">
              <span className="flex items-center gap-2">
                <img src="/icons/gcp/GCP-Logo.svg" alt="GCP" className="w-4 h-4" />
                Google Cloud
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              {/* Same nested structure as AWS */}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
};
```

### Test
- [ ] All categories collapsed when page loads
- [ ] Click category → expands
- [ ] Click again → collapses
- [ ] AWS/Azure/GCP have nested subcategories
- [ ] Subcategories also collapsed by default
- [ ] Shape panel scrolls when content overflows

---

## TASK 4: GROUPED PROPERTIES PANEL WITH SCROLL

### Problem
Properties panel is flat and doesn't scroll when content overflows.

### Solution

**Create src/components/editor/PropertiesPanel.tsx:**

```tsx
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useDiagramStore } from '@/stores/diagramStore';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Lock,
  Unlock,
} from 'lucide-react';

export const PropertiesPanel = () => {
  const { nodes, edges, selectedNodes, selectedEdges, updateNode, deleteSelected } = useDiagramStore();
  
  const selectedNode = nodes.find((n) => selectedNodes.includes(n.id));
  const selectedEdge = edges.find((e) => selectedEdges.includes(e.id));
  
  // Default expanded sections
  const [expandedSections, setExpandedSections] = useState<string[]>(['style', 'text']);

  if (!selectedNode && !selectedEdge) {
    return (
      <aside className="w-64 border-l bg-white flex flex-col h-full">
        <div className="p-3 border-b">
          <h2 className="font-semibold text-sm">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Select a shape to edit its properties
        </div>
      </aside>
    );
  }

  // Node properties
  if (selectedNode) {
    const data = selectedNode.data as any;

    const updateNodeData = (updates: Record<string, any>) => {
      updateNode(selectedNode.id, {
        data: { ...data, ...updates },
      });
    };

    return (
      <aside className="w-64 border-l bg-white flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b">
          <h2 className="font-semibold text-sm">Properties</h2>
          <p className="text-xs text-gray-500 truncate">{data.label || selectedNode.type}</p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <Accordion
            type="multiple"
            value={expandedSections}
            onValueChange={setExpandedSections}
            className="w-full"
          >
            {/* STYLE SECTION */}
            <AccordionItem value="style" className="border-b">
              <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:bg-gray-50">
                Style
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                {/* Fill Color */}
                <div className="space-y-1">
                  <Label className="text-xs">Fill Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={data.fillColor || '#ffffff'}
                      onChange={(e) => updateNodeData({ fillColor: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={data.fillColor || '#ffffff'}
                      onChange={(e) => updateNodeData({ fillColor: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Stroke Color */}
                <div className="space-y-1">
                  <Label className="text-xs">Stroke Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={data.strokeColor || '#000000'}
                      onChange={(e) => updateNodeData({ strokeColor: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={data.strokeColor || '#000000'}
                      onChange={(e) => updateNodeData({ strokeColor: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Stroke Width */}
                <div className="space-y-1">
                  <Label className="text-xs">Stroke Width: {data.strokeWidth || 2}px</Label>
                  <Slider
                    value={[data.strokeWidth || 2]}
                    onValueChange={([value]) => updateNodeData({ strokeWidth: value })}
                    min={0}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-1">
                  <Label className="text-xs">Opacity: {Math.round((data.opacity || 1) * 100)}%</Label>
                  <Slider
                    value={[(data.opacity || 1) * 100]}
                    onValueChange={([value]) => updateNodeData({ opacity: value / 100 })}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Corner Radius (for rectangles) */}
                {selectedNode.type === 'rectangle' && (
                  <div className="space-y-1">
                    <Label className="text-xs">Corner Radius: {data.borderRadius || 0}px</Label>
                    <Slider
                      value={[data.borderRadius || 0]}
                      onValueChange={([value]) => updateNodeData({ borderRadius: value })}
                      min={0}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Shadow */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Shadow</Label>
                  <input
                    type="checkbox"
                    checked={data.shadow || false}
                    onChange={(e) => updateNodeData({ shadow: e.target.checked })}
                    className="w-4 h-4"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* TEXT SECTION */}
            <AccordionItem value="text" className="border-b">
              <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:bg-gray-50">
                Text
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                {/* Label */}
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={data.label || ''}
                    onChange={(e) => updateNodeData({ label: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>

                {/* Font Family */}
                <div className="space-y-1">
                  <Label className="text-xs">Font Family</Label>
                  <select
                    value={data.fontFamily || 'Inter'}
                    onChange={(e) => updateNodeData({ fontFamily: e.target.value })}
                    className="w-full h-8 text-sm border rounded px-2"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>

                {/* Font Size */}
                <div className="space-y-1">
                  <Label className="text-xs">Font Size: {data.fontSize || 14}px</Label>
                  <Slider
                    value={[data.fontSize || 14]}
                    onValueChange={([value]) => updateNodeData({ fontSize: value })}
                    min={8}
                    max={72}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Font Color */}
                <div className="space-y-1">
                  <Label className="text-xs">Font Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={data.fontColor || '#000000'}
                      onChange={(e) => updateNodeData({ fontColor: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={data.fontColor || '#000000'}
                      onChange={(e) => updateNodeData({ fontColor: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Font Style Buttons */}
                <div className="space-y-1">
                  <Label className="text-xs">Font Style</Label>
                  <div className="flex gap-1">
                    <Button
                      variant={data.fontWeight === 'bold' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateNodeData({ 
                        fontWeight: data.fontWeight === 'bold' ? 'normal' : 'bold' 
                      })}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={data.fontStyle === 'italic' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateNodeData({ 
                        fontStyle: data.fontStyle === 'italic' ? 'normal' : 'italic' 
                      })}
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={data.textDecoration === 'underline' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateNodeData({ 
                        textDecoration: data.textDecoration === 'underline' ? 'none' : 'underline' 
                      })}
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Text Alignment */}
                <div className="space-y-1">
                  <Label className="text-xs">Alignment</Label>
                  <div className="flex gap-1">
                    <Button
                      variant={data.textAlign === 'left' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateNodeData({ textAlign: 'left' })}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={(data.textAlign || 'center') === 'center' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateNodeData({ textAlign: 'center' })}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={data.textAlign === 'right' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateNodeData({ textAlign: 'right' })}
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* SIZE & POSITION SECTION */}
            <AccordionItem value="size" className="border-b">
              <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:bg-gray-50">
                Size & Position
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                {/* Position */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">X</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedNode.position.x)}
                      onChange={(e) => {
                        const x = parseInt(e.target.value) || 0;
                        updateNode(selectedNode.id, {
                          position: { ...selectedNode.position, x },
                        });
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Y</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedNode.position.y)}
                      onChange={(e) => {
                        const y = parseInt(e.target.value) || 0;
                        updateNode(selectedNode.id, {
                          position: { ...selectedNode.position, y },
                        });
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Size */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Width</Label>
                    <Input
                      type="number"
                      value={selectedNode.width || 120}
                      onChange={(e) => {
                        const width = parseInt(e.target.value) || 120;
                        updateNode(selectedNode.id, {
                          style: { ...selectedNode.style, width },
                        });
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Height</Label>
                    <Input
                      type="number"
                      value={selectedNode.height || 80}
                      onChange={(e) => {
                        const height = parseInt(e.target.value) || 80;
                        updateNode(selectedNode.id, {
                          style: { ...selectedNode.style, height },
                        });
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Rotation */}
                <div className="space-y-1">
                  <Label className="text-xs">Rotation: {data.rotation || 0}°</Label>
                  <Slider
                    value={[data.rotation || 0]}
                    onValueChange={([value]) => updateNodeData({ rotation: value })}
                    min={0}
                    max={360}
                    step={15}
                    className="w-full"
                  />
                </div>

                {/* Lock aspect ratio */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Lock Aspect Ratio</Label>
                  <input
                    type="checkbox"
                    checked={data.lockAspectRatio || false}
                    onChange={(e) => updateNodeData({ lockAspectRatio: e.target.checked })}
                    className="w-4 h-4"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ARRANGE SECTION */}
            <AccordionItem value="arrange" className="border-b">
              <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:bg-gray-50">
                Arrange
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                {/* Z-Order */}
                <div className="space-y-1">
                  <Label className="text-xs">Layer Order</Label>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-8 flex-1 text-xs">
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Bring Forward
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 flex-1 text-xs">
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Send Back
                    </Button>
                  </div>
                </div>

                {/* Lock */}
                <div className="space-y-1">
                  <Label className="text-xs">Lock</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={() => updateNodeData({ locked: !data.locked })}
                  >
                    {data.locked ? (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3 mr-1" />
                        Unlocked
                      </>
                    )}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Actions Footer */}
        <div className="p-3 border-t space-y-2">
          <Button variant="outline" size="sm" className="w-full h-8 text-xs">
            <Copy className="w-3 h-3 mr-1" />
            Duplicate
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={deleteSelected}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </aside>
    );
  }

  // Edge properties (similar structure)
  if (selectedEdge) {
    // ... implement edge properties
  }

  return null;
};
```

### Test
- [ ] Properties panel shows "Select a shape" when nothing selected
- [ ] Select shape → properties appear
- [ ] Style section expands/collapses
- [ ] Text section expands/collapses
- [ ] Size & Position section works
- [ ] Arrange section works
- [ ] Panel scrolls when content overflows
- [ ] Color pickers work
- [ ] Sliders work
- [ ] Delete button works

---

## TASK 5: ADD MORE SHAPES

### Add these shapes to the Basic Shapes section:

```typescript
// Basic Shapes
const basicShapes = [
  { type: 'rectangle', name: 'Rectangle', icon: '▭' },
  { type: 'roundedRectangle', name: 'Rounded Rectangle', icon: '▢' },
  { type: 'ellipse', name: 'Ellipse', icon: '○' },
  { type: 'circle', name: 'Circle', icon: '●' },
  { type: 'diamond', name: 'Diamond', icon: '◇' },
  { type: 'triangle', name: 'Triangle', icon: '△' },
  { type: 'rightTriangle', name: 'Right Triangle', icon: '◺' },
  { type: 'pentagon', name: 'Pentagon', icon: '⬠' },
  { type: 'hexagon', name: 'Hexagon', icon: '⬡' },
  { type: 'octagon', name: 'Octagon', icon: '⯃' },
  { type: 'star', name: 'Star', icon: '☆' },
  { type: 'arrow', name: 'Arrow', icon: '→' },
  { type: 'doubleArrow', name: 'Double Arrow', icon: '↔' },
  { type: 'parallelogram', name: 'Parallelogram', icon: '▱' },
  { type: 'trapezoid', name: 'Trapezoid', icon: '⏢' },
  { type: 'cylinder', name: 'Cylinder', icon: '⌭' },
  { type: 'cube', name: 'Cube', icon: '▣' },
  { type: 'cloud', name: 'Cloud', icon: '☁' },
  { type: 'callout', name: 'Callout', icon: '💬' },
  { type: 'note', name: 'Note', icon: '📝' },
];

// Flowchart Shapes
const flowchartShapes = [
  { type: 'terminator', name: 'Start/End', icon: '⬭' },
  { type: 'process', name: 'Process', icon: '▭' },
  { type: 'decision', name: 'Decision', icon: '◇' },
  { type: 'data', name: 'Data (I/O)', icon: '▱' },
  { type: 'document', name: 'Document', icon: '📄' },
  { type: 'multiDocument', name: 'Multi-Document', icon: '📑' },
  { type: 'predefinedProcess', name: 'Predefined Process', icon: '⊞' },
  { type: 'manualInput', name: 'Manual Input', icon: '⌨' },
  { type: 'preparation', name: 'Preparation', icon: '⬡' },
  { type: 'database', name: 'Database', icon: '⌭' },
  { type: 'delay', name: 'Delay', icon: '⏳' },
  { type: 'or', name: 'Or', icon: '○' },
  { type: 'summingJunction', name: 'Summing Junction', icon: '⊕' },
  { type: 'merge', name: 'Merge', icon: '▽' },
  { type: 'offPageConnector', name: 'Off-Page Connector', icon: '⬠' },
];

// UML Shapes
const umlShapes = [
  { type: 'umlClass', name: 'Class', icon: '▭' },
  { type: 'umlInterface', name: 'Interface', icon: '○' },
  { type: 'umlActor', name: 'Actor', icon: '🧑' },
  { type: 'umlUseCase', name: 'Use Case', icon: '○' },
  { type: 'umlPackage', name: 'Package', icon: '📦' },
  { type: 'umlComponent', name: 'Component', icon: '⊞' },
  { type: 'umlNode', name: 'Node', icon: '▣' },
  { type: 'umlObject', name: 'Object', icon: '▭' },
  { type: 'umlState', name: 'State', icon: '▢' },
  { type: 'umlActivity', name: 'Activity', icon: '▢' },
  { type: 'umlNote', name: 'Note', icon: '📝' },
  { type: 'umlInitial', name: 'Initial', icon: '●' },
  { type: 'umlFinal', name: 'Final', icon: '◉' },
  { type: 'umlDecision', name: 'Decision', icon: '◇' },
  { type: 'umlFork', name: 'Fork/Join', icon: '▬' },
];

// Network Shapes
const networkShapes = [
  { type: 'server', name: 'Server', icon: '🖥' },
  { type: 'database', name: 'Database', icon: '⌭' },
  { type: 'router', name: 'Router', icon: '📡' },
  { type: 'switch', name: 'Switch', icon: '🔀' },
  { type: 'firewall', name: 'Firewall', icon: '🔥' },
  { type: 'loadBalancer', name: 'Load Balancer', icon: '⚖' },
  { type: 'cloud', name: 'Cloud', icon: '☁' },
  { type: 'user', name: 'User', icon: '👤' },
  { type: 'users', name: 'Users', icon: '👥' },
  { type: 'laptop', name: 'Laptop', icon: '💻' },
  { type: 'mobile', name: 'Mobile', icon: '📱' },
  { type: 'internet', name: 'Internet', icon: '🌐' },
];
```

### Test
- [ ] All basic shapes render correctly
- [ ] All flowchart shapes render correctly
- [ ] All UML shapes render correctly
- [ ] Network shapes category added
- [ ] Each shape has connection handles
- [ ] Each shape can be resized
- [ ] Each shape supports text labels

---

## TASK 6: ADVANCED FEATURES

### 6.1 Double-Click to Edit Text

```tsx
// In each node component, add text editing capability
const [isEditing, setIsEditing] = useState(false);
const [editText, setEditText] = useState(data.label);

const handleDoubleClick = () => {
  setIsEditing(true);
  setEditText(data.label);
};

const handleBlur = () => {
  setIsEditing(false);
  updateNodeData({ label: editText });
};

// In the render:
{isEditing ? (
  <input
    type="text"
    value={editText}
    onChange={(e) => setEditText(e.target.value)}
    onBlur={handleBlur}
    onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
    autoFocus
    className="w-full text-center bg-transparent border-none outline-none"
    style={{ fontSize, color: fontColor }}
  />
) : (
  <span onDoubleClick={handleDoubleClick}>{label}</span>
)}
```

### 6.2 Copy/Paste Keyboard Shortcuts

```tsx
// In useKeyboardShortcuts.ts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Copy
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault();
      copySelectedNodes();
    }
    
    // Paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      pasteNodes();
    }
    
    // Duplicate
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      duplicateSelectedNodes();
    }
    
    // Select All
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      selectAllNodes();
    }
    
    // Delete
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!isEditingText) {
        e.preventDefault();
        deleteSelected();
      }
    }
    
    // Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    
    // Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 6.3 Grid Snapping Toggle

Add to toolbar:
```tsx
<Button
  variant={snapToGrid ? 'default' : 'outline'}
  size="sm"
  onClick={() => setSnapToGrid(!snapToGrid)}
  title="Snap to Grid"
>
  <Grid className="w-4 h-4" />
</Button>
```

---

## TESTING CHECKLIST

After implementing all tasks, verify:

### Resize
- [ ] Select any shape → 8 resize handles appear
- [ ] Drag corner → shape resizes proportionally
- [ ] Drag edge → shape resizes in one direction
- [ ] Cloud icons can be resized
- [ ] Minimum size enforced

### Cloud Icons
- [ ] AWS icons show correct official styling
- [ ] Azure icons show correct official styling
- [ ] GCP icons show correct official styling
- [ ] Icons are organized by category

### Shape Panel
- [ ] All categories collapsed on load
- [ ] Click category → expands
- [ ] Cloud providers have nested subcategories
- [ ] Search filters shapes
- [ ] Panel scrolls properly

### Properties Panel
- [ ] Shows "Select a shape" when nothing selected
- [ ] Style section: fill, stroke, opacity, shadow
- [ ] Text section: label, font, size, color, alignment
- [ ] Size & Position section: x, y, width, height, rotation
- [ ] Arrange section: layer order, lock
- [ ] Panel scrolls when content overflows
- [ ] All controls work and update shape

### Advanced Features
- [ ] Double-click shape → edit text inline
- [ ] Ctrl+C → copies selected shapes
- [ ] Ctrl+V → pastes shapes
- [ ] Ctrl+D → duplicates shapes
- [ ] Ctrl+Z → undo
- [ ] Ctrl+Y → redo
- [ ] Delete key removes shapes

---

## END OF PROMPT
# DIAGMO PRO - Phase 2B: SVG Icons & Connector Properties
## For Claude Code Implementation

Copy this entire prompt to Claude Code:

---

## OVERVIEW

Add two important features:
1. Replace emoji icons with proper black & white SVG icons for shapes
2. Add comprehensive connector/line properties (bidirectional, dotted, dashed, etc.)

---

## TASK 1: CREATE SVG ICONS FOR ALL SHAPES

### Problem
Currently using emoji icons (🔷, ▭, etc.) which look unprofessional.

### Solution
Create proper SVG icon components for each shape category.

**Create src/components/icons/ShapeIcons.tsx:**

```tsx
import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// ============================================
// BASIC SHAPES
// ============================================

export const RectangleIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const RoundedRectangleIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const EllipseIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse cx="12" cy="12" rx="9" ry="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const CircleIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const DiamondIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3L21 12L12 21L3 12L12 3Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const TriangleIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4L21 20H3L12 4Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const RightTriangleIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4V20H20L4 4Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const PentagonIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L22 9L18 21H6L2 9L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const HexagonIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const OctagonIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 2H16L22 8V16L16 22H8L2 16V8L8 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L14.5 9H22L16 14L18.5 21L12 17L5.5 21L8 14L2 9H9.5L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 12H20M14 6L20 12L14 18" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const DoubleArrowIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 12H20M7 7L2 12L7 17M17 7L22 12L17 17" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const ParallelogramIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 5H22L18 19H2L6 5Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const TrapezoidIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 6H18L21 18H3L6 6Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const CylinderIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse cx="12" cy="5" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M4 5V19C4 20.66 7.58 22 12 22C16.42 22 20 20.66 20 19V5" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const CubeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L22 7V17L12 22L2 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M12 12L22 7M12 12L2 7M12 12V22" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const CloudIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 19C3.79 19 2 17.21 2 15C2 13.14 3.28 11.59 5 11.14C5 11.09 5 11.05 5 11C5 8.24 7.24 6 10 6C12.04 6 13.77 7.24 14.55 9C14.69 9 14.84 9 15 9C17.76 9 20 11.24 20 14C20 16.76 17.76 19 15 19H6Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const CalloutIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4H20V16H10L6 20V16H4V4Z" stroke="currentColor" strokeWidth="1.5" fill="none" rx="2" />
  </svg>
);

export const NoteIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4H16L20 8V20H4V4Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M16 4V8H20" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

// ============================================
// FLOWCHART SHAPES
// ============================================

export const TerminatorIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="7" width="18" height="10" rx="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const ProcessIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="6" width="18" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const DecisionIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3L21 12L12 21L3 12L12 3Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const DataIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 5H22L18 19H2L6 5Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const DocumentIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4H20V18C20 18 16 16 12 18C8 20 4 18 4 18V4Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const MultiDocumentIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 6H18V16C18 16 15 14.5 12 16C9 17.5 6 16 6 16V6Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M8 4H20V14" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M4 8V18C4 18 7 16.5 10 18" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const PredefinedProcessIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="6" width="18" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="6" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="1.5" />
    <line x1="18" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const ManualInputIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 8L21 4V20H3V8Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const PreparationIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 6H18L21 12L18 18H6L3 12L6 6Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const DatabaseIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse cx="12" cy="5" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M4 5V19C4 20.66 7.58 22 12 22C16.42 22 20 20.66 20 19V5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M4 12C4 13.66 7.58 15 12 15C16.42 15 20 13.66 20 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const DelayIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6H15C18.31 6 21 9.13 21 12C21 14.87 18.31 18 15 18H3V6Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const OrIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" />
    <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const SummingJunctionIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" />
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const MergeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 21L3 6H21L12 21Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const OffPageConnectorIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 4H18V16L12 22L6 16V4Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

// ============================================
// UML SHAPES
// ============================================

export const UMLClassIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const UMLInterfaceIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="12" y1="12" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const UMLActorIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" />
    <line x1="6" y1="11" x2="18" y2="11" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="16" x2="7" y2="22" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="16" x2="17" y2="22" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const UMLUseCaseIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse cx="12" cy="12" rx="9" ry="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const UMLPackageIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6H10V3H3V6Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="3" y="6" width="18" height="15" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const UMLComponentIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="3" width="14" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="2" y="7" width="6" height="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="2" y="14" width="6" height="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const UMLNodeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 7L8 3H21V17L18 21H3V7Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M3 7H16L21 3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M16 7V21" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const UMLStateIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const UMLActivityIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const UMLNoteIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 3H16L20 7V21H4V3Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M16 3V7H20" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const UMLInitialIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
  </svg>
);

export const UMLFinalIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
  </svg>
);

export const UMLForkIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="10" width="16" height="4" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// ============================================
// NETWORK SHAPES
// ============================================

export const ServerIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="2" width="16" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="4" y="9" width="16" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="4" y="16" width="16" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="7" cy="5" r="1" fill="currentColor" />
    <circle cx="7" cy="12" r="1" fill="currentColor" />
    <circle cx="7" cy="19" r="1" fill="currentColor" />
  </svg>
);

export const RouterIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="8" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="6" y1="5" x2="6" y2="8" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="3" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" />
    <line x1="18" y1="5" x2="18" y2="8" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="6" cy="13" r="1.5" fill="currentColor" />
    <circle cx="10" cy="13" r="1.5" fill="currentColor" />
  </svg>
);

export const SwitchIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="8" width="20" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="6" y1="11" x2="6" y2="13" stroke="currentColor" strokeWidth="2" />
    <line x1="9" y1="11" x2="9" y2="13" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="11" x2="12" y2="13" stroke="currentColor" strokeWidth="2" />
    <line x1="15" y1="11" x2="15" y2="13" stroke="currentColor" strokeWidth="2" />
    <line x1="18" y1="11" x2="18" y2="13" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const FirewallIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth="1.5" />
    <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="1.5" />
    <line x1="15" y1="3" x2="15" y2="21" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const LoadBalancerIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="5" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="19" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="10" y1="7" x2="6" y2="16" stroke="currentColor" strokeWidth="1.5" />
    <line x1="14" y1="7" x2="18" y2="16" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M4 21V18C4 15.79 7.58 14 12 14C16.42 14 20 15.79 20 18V21" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M2 20V18C2 16.34 4.69 15 9 15C9.5 15 10 15.03 10.5 15.08" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M14 15.08C14.5 15.03 15 15 15.5 15C19.81 15 22.5 16.34 22.5 18V20" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const LaptopIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M1 18H23L21 20H3L1 18Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const MobileIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="6" y="2" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="10" y1="18" x2="14" y2="18" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const InternetIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// ============================================
// CONNECTOR / LINE ICONS
// ============================================

export const SolidLineIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const DashedLineIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="6 3" />
  </svg>
);

export const DottedLineIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="2 3" />
  </svg>
);

export const ArrowLineIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="3" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2" />
    <path d="M15 8L21 12L15 16" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

export const BiDirectionalArrowIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2" />
    <path d="M9 8L3 12L9 16" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M15 8L21 12L15 16" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

// Export all icons as a map
export const shapeIcons = {
  // Basic
  rectangle: RectangleIcon,
  roundedRectangle: RoundedRectangleIcon,
  ellipse: EllipseIcon,
  circle: CircleIcon,
  diamond: DiamondIcon,
  triangle: TriangleIcon,
  rightTriangle: RightTriangleIcon,
  pentagon: PentagonIcon,
  hexagon: HexagonIcon,
  octagon: OctagonIcon,
  star: StarIcon,
  arrowRight: ArrowRightIcon,
  doubleArrow: DoubleArrowIcon,
  parallelogram: ParallelogramIcon,
  trapezoid: TrapezoidIcon,
  cylinder: CylinderIcon,
  cube: CubeIcon,
  cloud: CloudIcon,
  callout: CalloutIcon,
  note: NoteIcon,
  
  // Flowchart
  terminator: TerminatorIcon,
  process: ProcessIcon,
  decision: DecisionIcon,
  data: DataIcon,
  document: DocumentIcon,
  multiDocument: MultiDocumentIcon,
  predefinedProcess: PredefinedProcessIcon,
  manualInput: ManualInputIcon,
  preparation: PreparationIcon,
  database: DatabaseIcon,
  delay: DelayIcon,
  or: OrIcon,
  summingJunction: SummingJunctionIcon,
  merge: MergeIcon,
  offPageConnector: OffPageConnectorIcon,
  
  // UML
  umlClass: UMLClassIcon,
  umlInterface: UMLInterfaceIcon,
  umlActor: UMLActorIcon,
  umlUseCase: UMLUseCaseIcon,
  umlPackage: UMLPackageIcon,
  umlComponent: UMLComponentIcon,
  umlNode: UMLNodeIcon,
  umlState: UMLStateIcon,
  umlActivity: UMLActivityIcon,
  umlNote: UMLNoteIcon,
  umlInitial: UMLInitialIcon,
  umlFinal: UMLFinalIcon,
  umlFork: UMLForkIcon,
  
  // Network
  server: ServerIcon,
  router: RouterIcon,
  switch: SwitchIcon,
  firewall: FirewallIcon,
  loadBalancer: LoadBalancerIcon,
  user: UserIcon,
  users: UsersIcon,
  laptop: LaptopIcon,
  mobile: MobileIcon,
  internet: InternetIcon,
  
  // Lines
  solidLine: SolidLineIcon,
  dashedLine: DashedLineIcon,
  dottedLine: DottedLineIcon,
  arrowLine: ArrowLineIcon,
  biDirectionalArrow: BiDirectionalArrowIcon,
};
```

### Update ShapePanel to use SVG icons:

```tsx
import { shapeIcons } from '@/components/icons/ShapeIcons';

// In shape item:
const ShapeItem = ({ shape }) => {
  const IconComponent = shapeIcons[shape.type];
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, shape.type)}
      className="aspect-square flex flex-col items-center justify-center p-1 border rounded cursor-grab hover:bg-gray-100"
      title={shape.name}
    >
      {IconComponent ? (
        <IconComponent size={28} className="text-gray-700" />
      ) : (
        <span className="text-lg">{shape.icon}</span>
      )}
      <span className="text-[9px] text-gray-500 mt-0.5 truncate w-full text-center">
        {shape.name}
      </span>
    </div>
  );
};
```

---

## TASK 2: CONNECTOR/LINE PROPERTIES

### Add Line Properties Panel

When a connector/edge is selected, show these properties:

**Update PropertiesPanel.tsx to handle edge selection:**

```tsx
// Add this section for edge properties

if (selectedEdge) {
  const edgeData = selectedEdge.data || {};
  
  const updateEdgeData = (updates: Record<string, any>) => {
    updateEdge(selectedEdge.id, {
      data: { ...edgeData, ...updates },
      ...updates,
    });
  };

  return (
    <aside className="w-64 border-l bg-white flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm">Line Properties</h2>
        <p className="text-xs text-gray-500">Connector</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={['line-style', 'arrows']} className="w-full">
          
          {/* LINE STYLE SECTION */}
          <AccordionItem value="line-style" className="border-b">
            <AccordionTrigger className="px-3 py-2 text-sm font-medium">
              Line Style
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              
              {/* Line Type */}
              <div className="space-y-1">
                <Label className="text-xs">Line Type</Label>
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    variant={edgeData.lineType === 'solid' || !edgeData.lineType ? 'default' : 'outline'}
                    size="sm"
                    className="h-8"
                    onClick={() => updateEdgeData({ lineType: 'solid', style: { strokeDasharray: 'none' } })}
                  >
                    <SolidLineIcon size={16} />
                  </Button>
                  <Button
                    variant={edgeData.lineType === 'dashed' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8"
                    onClick={() => updateEdgeData({ lineType: 'dashed', style: { strokeDasharray: '8 4' } })}
                  >
                    <DashedLineIcon size={16} />
                  </Button>
                  <Button
                    variant={edgeData.lineType === 'dotted' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8"
                    onClick={() => updateEdgeData({ lineType: 'dotted', style: { strokeDasharray: '2 4' } })}
                  >
                    <DottedLineIcon size={16} />
                  </Button>
                </div>
              </div>

              {/* Line Color */}
              <div className="space-y-1">
                <Label className="text-xs">Line Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={edgeData.strokeColor || '#000000'}
                    onChange={(e) => updateEdgeData({ 
                      strokeColor: e.target.value,
                      style: { ...selectedEdge.style, stroke: e.target.value }
                    })}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={edgeData.strokeColor || '#000000'}
                    onChange={(e) => updateEdgeData({ 
                      strokeColor: e.target.value,
                      style: { ...selectedEdge.style, stroke: e.target.value }
                    })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Line Width */}
              <div className="space-y-1">
                <Label className="text-xs">Line Width: {edgeData.strokeWidth || 2}px</Label>
                <Slider
                  value={[edgeData.strokeWidth || 2]}
                  onValueChange={([value]) => updateEdgeData({ 
                    strokeWidth: value,
                    style: { ...selectedEdge.style, strokeWidth: value }
                  })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Line Path Type */}
              <div className="space-y-1">
                <Label className="text-xs">Path Type</Label>
                <select
                  value={selectedEdge.type || 'smoothstep'}
                  onChange={(e) => updateEdge(selectedEdge.id, { type: e.target.value })}
                  className="w-full h-8 text-sm border rounded px-2"
                >
                  <option value="straight">Straight</option>
                  <option value="smoothstep">Smooth Step (Orthogonal)</option>
                  <option value="step">Step (Right Angles)</option>
                  <option value="bezier">Bezier (Curved)</option>
                </select>
              </div>

            </AccordionContent>
          </AccordionItem>

          {/* ARROWS SECTION */}
          <AccordionItem value="arrows" className="border-b">
            <AccordionTrigger className="px-3 py-2 text-sm font-medium">
              Arrows
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              
              {/* Start Arrow */}
              <div className="space-y-1">
                <Label className="text-xs">Start Arrow</Label>
                <select
                  value={edgeData.markerStart || 'none'}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateEdgeData({ markerStart: value });
                    updateEdge(selectedEdge.id, {
                      markerStart: value === 'none' ? undefined : { type: value },
                    });
                  }}
                  className="w-full h-8 text-sm border rounded px-2"
                >
                  <option value="none">None</option>
                  <option value="arrow">Arrow</option>
                  <option value="arrowclosed">Arrow (Filled)</option>
                </select>
              </div>

              {/* End Arrow */}
              <div className="space-y-1">
                <Label className="text-xs">End Arrow</Label>
                <select
                  value={edgeData.markerEnd || 'arrowclosed'}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateEdgeData({ markerEnd: value });
                    updateEdge(selectedEdge.id, {
                      markerEnd: value === 'none' ? undefined : { type: value },
                    });
                  }}
                  className="w-full h-8 text-sm border rounded px-2"
                >
                  <option value="none">None</option>
                  <option value="arrow">Arrow</option>
                  <option value="arrowclosed">Arrow (Filled)</option>
                </select>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1">
                <Label className="text-xs">Quick Presets</Label>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      updateEdgeData({ markerStart: 'none', markerEnd: 'arrowclosed' });
                      updateEdge(selectedEdge.id, {
                        markerStart: undefined,
                        markerEnd: { type: 'arrowclosed' },
                      });
                    }}
                  >
                    → One-way
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      updateEdgeData({ markerStart: 'arrowclosed', markerEnd: 'arrowclosed' });
                      updateEdge(selectedEdge.id, {
                        markerStart: { type: 'arrowclosed' },
                        markerEnd: { type: 'arrowclosed' },
                      });
                    }}
                  >
                    ↔ Bidirectional
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      updateEdgeData({ markerStart: 'none', markerEnd: 'none' });
                      updateEdge(selectedEdge.id, {
                        markerStart: undefined,
                        markerEnd: undefined,
                      });
                    }}
                  >
                    — No Arrows
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      updateEdgeData({ markerStart: 'arrowclosed', markerEnd: 'none' });
                      updateEdge(selectedEdge.id, {
                        markerStart: { type: 'arrowclosed' },
                        markerEnd: undefined,
                      });
                    }}
                  >
                    ← Reverse
                  </Button>
                </div>
              </div>

            </AccordionContent>
          </AccordionItem>

          {/* LABEL SECTION */}
          <AccordionItem value="label" className="border-b">
            <AccordionTrigger className="px-3 py-2 text-sm font-medium">
              Label
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              
              {/* Label Text */}
              <div className="space-y-1">
                <Label className="text-xs">Text</Label>
                <Input
                  value={edgeData.label || ''}
                  onChange={(e) => updateEdge(selectedEdge.id, { label: e.target.value })}
                  placeholder="Enter label..."
                  className="h-8 text-sm"
                />
              </div>

              {/* Label Background */}
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show Background</Label>
                <input
                  type="checkbox"
                  checked={edgeData.labelBgPadding !== undefined}
                  onChange={(e) => updateEdge(selectedEdge.id, {
                    labelBgPadding: e.target.checked ? [4, 4] : undefined,
                    labelBgStyle: e.target.checked ? { fill: 'white' } : undefined,
                    labelBgBorderRadius: e.target.checked ? 4 : undefined,
                  })}
                  className="w-4 h-4"
                />
              </div>

            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>

      {/* Actions */}
      <div className="p-3 border-t">
        <Button
          variant="destructive"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={() => deleteEdge(selectedEdge.id)}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete Line
        </Button>
      </div>
    </aside>
  );
}
```

### Add updateEdge function to diagramStore:

```typescript
// In diagramStore.ts

updateEdge: (edgeId: string, updates: Partial<Edge>) => {
  set((state) => ({
    edges: state.edges.map((edge) =>
      edge.id === edgeId ? { ...edge, ...updates } : edge
    ),
  }));
  get().saveToHistory();
},

deleteEdge: (edgeId: string) => {
  set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== edgeId),
    selectedEdges: state.selectedEdges.filter((id) => id !== edgeId),
  }));
  get().saveToHistory();
},
```

---

## TESTING CHECKLIST

### SVG Icons
- [ ] All Basic Shapes show black & white SVG icons
- [ ] All Flowchart shapes show black & white SVG icons
- [ ] All UML shapes show black & white SVG icons
- [ ] All Network shapes show black & white SVG icons
- [ ] Icons scale properly at different sizes
- [ ] Icons look crisp (not blurry)

### Connector Properties
- [ ] Select a line → Line Properties panel appears
- [ ] Can change line type: Solid / Dashed / Dotted
- [ ] Line type preview updates immediately
- [ ] Can change line color
- [ ] Can change line width (1-10px)
- [ ] Can change path type: Straight / Smooth Step / Step / Bezier
- [ ] Can add/remove Start Arrow
- [ ] Can add/remove End Arrow
- [ ] Bidirectional preset works (arrows on both ends)
- [ ] No Arrows preset works
- [ ] Can add label to line
- [ ] Label shows on the line
- [ ] Delete Line button works

---

## END OF PROMPT
