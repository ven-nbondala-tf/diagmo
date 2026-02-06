import { useCallback, useState, useMemo } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui'
import { SHAPE_CATEGORIES, SHAPE_LABELS, CLOUD_PROVIDER_CATEGORIES } from '@/constants'
import type { ShapeType, WebImageResult, CustomShape } from '@/types'
import { Search, ChevronRight, ChevronLeft, Shapes, ImageIcon, Square, Diamond, Circle, Type, ArrowRight, StickyNote, FolderOpen, Settings, Table2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { cloudIconComponents, type CloudIconType } from './icons'
import { WebImageSearch } from './WebImageSearch'
import { ShapeLibraryDialog } from './ShapeLibraryDialog'
import { useShapeLibraries, useShapesByLibrary } from '@/hooks'

// SVG Shape Preview Component - matches actual canvas shapes
const ShapePreview = ({ type }: { type: ShapeType }) => {
  const size = 32
  const strokeWidth = 1.5
  const fill = '#f3f4f6'
  const stroke = '#6b7280'

  switch (type) {
    // ===== BASIC SHAPES =====
    case 'rectangle':
    case 'process':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="8" width="24" height="16" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'rounded-rectangle':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="8" width="24" height="16" rx="6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'ellipse':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <ellipse cx="16" cy="16" rx="12" ry="8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'circle':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="10" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'diamond':
    case 'decision':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="16,4 28,16 16,28 4,16" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'triangle':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="16,4 28,28 4,28" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'pentagon':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="16,3 29,12 24,28 8,28 3,12" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'hexagon':
    case 'preparation':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="8,4 24,4 30,16 24,28 8,28 2,16" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'octagon':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="10,3 22,3 29,10 29,22 22,29 10,29 3,22 3,10" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="16,2 19.5,11 29,11 21.5,17 24,27 16,21 8,27 10.5,17 3,11 12.5,11" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'parallelogram':
    case 'data':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="8,8 28,8 24,24 4,24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'trapezoid':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="8,8 24,8 28,24 4,24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'cylinder':
    case 'database':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <ellipse cx="16" cy="8" rx="10" ry="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <path d="M6,8 L6,24 C6,26.5 10.5,28 16,28 C21.5,28 26,26.5 26,24 L26,8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <ellipse cx="16" cy="24" rx="10" ry="4" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'arrow':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="4,12 18,12 18,6 28,16 18,26 18,20 4,20" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'double-arrow':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="4,16 10,8 10,12 22,12 22,8 28,16 22,24 22,20 10,20 10,24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'cloud':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path d="M8,22 C4,22 2,19 2,16 C2,13 4,10 8,10 C8,6 12,4 16,4 C20,4 24,6 26,10 C30,10 30,14 30,16 C30,20 28,22 24,22 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'callout':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path d="M4,4 L28,4 L28,20 L12,20 L8,28 L10,20 L4,20 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'note':
    case 'uml-note':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path d="M4,4 L22,4 L28,10 L28,28 L4,28 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <path d="M22,4 L22,10 L28,10" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'text':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <text x="8" y="22" fontSize="18" fontWeight="bold" fill={stroke}>T</text>
        </svg>
      )

    // ===== FLOWCHART =====
    case 'terminator':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="10" width="24" height="12" rx="6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'document':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path d="M4,4 L28,4 L28,24 C28,24 22,28 16,24 C10,20 4,24 4,24 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'multi-document':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="8" y="2" width="20" height="18" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="6" y="4" width="20" height="18" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="4" y="6" width="20" height="18" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'predefined-process':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="8" width="24" height="16" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="8" y1="8" x2="8" y2="24" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="24" y1="8" x2="24" y2="24" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'manual-input':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="4,12 28,6 28,26 4,26" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'delay':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path d="M4,8 L20,8 C26,8 28,12 28,16 C28,20 26,24 20,24 L4,24 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'merge':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="4,6 28,6 16,26" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'or':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="10" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="6" x2="16" y2="26" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="6" y1="16" x2="26" y2="16" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'summing-junction':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="10" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="9" y1="9" x2="23" y2="23" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="23" y1="9" x2="9" y2="23" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    // ===== UML =====
    case 'uml-class':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="4" y1="12" x2="28" y2="12" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="4" y1="20" x2="28" y2="20" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'uml-interface':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="10" r="6" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="16" x2="16" y2="28" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'uml-actor':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="6" r="4" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="10" x2="16" y2="20" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="8" y1="14" x2="24" y2="14" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="20" x2="10" y2="28" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="20" x2="22" y2="28" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'uml-usecase':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <ellipse cx="16" cy="16" rx="12" ry="8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'uml-component':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="8" y="4" width="20" height="24" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="4" y="8" width="8" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="4" y="16" width="8" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'uml-package':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="10" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="4" y="8" width="24" height="18" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'uml-state':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="8" width="24" height="16" rx="8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    // ===== NETWORK =====
    case 'server':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="6" y="4" width="20" height="24" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="6" y1="12" x2="26" y2="12" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="6" y1="20" x2="26" y2="20" stroke={stroke} strokeWidth={strokeWidth} />
          <circle cx="10" cy="8" r="1.5" fill="#22c55e" />
          <circle cx="14" cy="8" r="1.5" fill="#22c55e" />
        </svg>
      )

    case 'router':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="12" width="24" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="8" y1="6" x2="8" y2="12" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="6" x2="16" y2="12" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="24" y1="6" x2="24" y2="12" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'switch':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="10" width="24" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <circle cx="10" cy="16" r="2" fill="#22c55e" />
          <circle cx="16" cy="16" r="2" fill="#22c55e" />
          <circle cx="22" cy="16" r="2" fill="#22c55e" />
        </svg>
      )

    case 'firewall':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill={fill} stroke="#dc2626" strokeWidth={strokeWidth} />
          <rect x="8" y="8" width="4" height="4" fill="#dc2626" />
          <rect x="14" y="8" width="4" height="4" fill="#dc2626" />
          <rect x="20" y="8" width="4" height="4" fill="#dc2626" />
          <rect x="11" y="14" width="4" height="4" fill="#dc2626" />
          <rect x="17" y="14" width="4" height="4" fill="#dc2626" />
        </svg>
      )

    case 'load-balancer':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="8,4 24,4 28,16 24,28 8,28 4,16" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'user':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="10" r="6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <path d="M6,28 C6,22 10,18 16,18 C22,18 26,22 26,28" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'users':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="12" cy="10" r="5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <circle cx="22" cy="10" r="5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity="0.6" />
          <path d="M4,26 C4,20 7,18 12,18 C17,18 20,20 20,26" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <path d="M14,26 C14,20 17,18 22,18 C27,18 28,20 28,26" fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity="0.6" />
        </svg>
      )

    case 'laptop':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="6" y="6" width="20" height="14" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="4" y="20" width="24" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'mobile':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="10" y="4" width="12" height="24" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <circle cx="16" cy="24" r="2" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'internet':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <ellipse cx="16" cy="16" rx="5" ry="12" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="4" y1="16" x2="28" y2="16" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="4" x2="16" y2="28" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    // ===== CLOUD PROVIDER ICONS (AWS, Azure, GCP) =====
    // Use official icons from cloudIconComponents
    // AWS Compute
    case 'aws-ec2':
    case 'aws-lambda':
    case 'aws-elastic-beanstalk':
    case 'aws-lightsail':
    case 'aws-outposts':
    case 'aws-wavelength':
    case 'aws-local-zones':
    case 'aws-batch':
    // AWS Containers
    case 'aws-ecs':
    case 'aws-eks':
    case 'aws-fargate':
    case 'aws-ecr':
    case 'aws-app-runner':
    // AWS Storage
    case 'aws-s3':
    case 'aws-ebs':
    case 'aws-efs':
    case 'aws-fsx':
    case 'aws-storage-gateway':
    case 'aws-backup':
    case 'aws-snow-family':
    // AWS Database
    case 'aws-rds':
    case 'aws-dynamodb':
    case 'aws-elasticache':
    case 'aws-redshift':
    case 'aws-neptune':
    case 'aws-documentdb':
    case 'aws-qldb':
    case 'aws-timestream':
    case 'aws-memorydb':
    case 'aws-keyspaces':
    // AWS Networking
    case 'aws-vpc':
    case 'aws-cloudfront':
    case 'aws-route53':
    case 'aws-api-gateway':
    case 'aws-direct-connect':
    case 'aws-global-accelerator':
    case 'aws-transit-gateway':
    case 'aws-privatelink':
    case 'aws-elb':
    // AWS Security
    case 'aws-iam':
    case 'aws-cognito':
    case 'aws-secrets-manager':
    case 'aws-kms':
    case 'aws-waf':
    case 'aws-shield':
    case 'aws-guardduty':
    case 'aws-inspector':
    case 'aws-macie':
    case 'aws-security-hub':
    // AWS Analytics
    case 'aws-kinesis':
    case 'aws-athena':
    case 'aws-emr':
    case 'aws-glue':
    case 'aws-lake-formation':
    case 'aws-quicksight':
    case 'aws-data-pipeline':
    case 'aws-msk':
    case 'aws-opensearch':
    // AWS ML/AI
    case 'aws-sagemaker':
    case 'aws-rekognition':
    case 'aws-comprehend':
    case 'aws-lex':
    case 'aws-polly':
    case 'aws-transcribe':
    case 'aws-translate':
    case 'aws-textract':
    case 'aws-bedrock':
    // AWS Integration
    case 'aws-sns':
    case 'aws-sqs':
    case 'aws-eventbridge':
    case 'aws-step-functions':
    case 'aws-appsync':
    case 'aws-mq':
    case 'aws-app-mesh':
    // AWS Developer
    case 'aws-codecommit':
    case 'aws-codebuild':
    case 'aws-codedeploy':
    case 'aws-codepipeline':
    case 'aws-cloud9':
    case 'aws-xray':
    case 'aws-cloudshell':
    // AWS Management
    case 'aws-cloudwatch':
    case 'aws-cloudtrail':
    case 'aws-config':
    case 'aws-systems-manager':
    case 'aws-cloudformation':
    case 'aws-service-catalog':
    case 'aws-trusted-advisor':
    case 'aws-organizations':
    case 'aws-control-tower':
    case 'aws-amplify':
    // Azure - Core
    case 'azure-vm':
    case 'azure-storage':
    case 'azure-functions':
    case 'azure-sql':
    case 'azure-cosmos':
    case 'azure-app-service':
    case 'azure-aks':
    case 'azure-cdn':
    case 'azure-vnet':
    case 'azure-keyvault':
    case 'azure-event-hub':
    case 'azure-service-bus':
    case 'azure-logic-apps':
    case 'azure-databricks':
    case 'azure-active-directory':
    case 'azure-container-registry':
    case 'azure-redis-cache':
    case 'azure-app-gateway':
    case 'azure-front-door':
    case 'azure-monitor':
    // Azure - Analytics
    case 'azure-synapse':
    case 'azure-data-factory':
    case 'azure-stream-analytics':
    case 'azure-hdinsight':
    case 'azure-data-lake':
    case 'azure-analysis-services':
    case 'azure-log-analytics':
    case 'azure-purview':
    // Azure - Compute
    case 'azure-vm-scale-sets':
    case 'azure-batch':
    case 'azure-cloud-services':
    case 'azure-service-fabric':
    // Azure - Containers
    case 'azure-container-instances':
    case 'azure-container-apps':
    // Azure - Databases
    case 'azure-mysql':
    case 'azure-postgresql':
    case 'azure-mariadb':
    case 'azure-sql-managed-instance':
    case 'azure-table-storage':
    // Azure - Networking
    case 'azure-load-balancer':
    case 'azure-vpn-gateway':
    case 'azure-expressroute':
    case 'azure-traffic-manager':
    case 'azure-dns':
    case 'azure-private-link':
    case 'azure-bastion':
    case 'azure-nat-gateway':
    // Azure - Security
    case 'azure-security-center':
    case 'azure-sentinel':
    case 'azure-ddos-protection':
    case 'azure-firewall':
    case 'azure-defender':
    // Azure - AI + ML
    case 'azure-cognitive-services':
    case 'azure-machine-learning':
    case 'azure-bot-service':
    case 'azure-openai':
    // Azure - Integration
    case 'azure-api-management':
    case 'azure-event-grid':
    // Azure - Storage
    case 'azure-blob-storage':
    case 'azure-file-storage':
    case 'azure-queue-storage':
    case 'azure-data-lake-storage':
    case 'azure-netapp-files':
    // Azure - Identity
    case 'azure-b2c':
    case 'azure-managed-identities':
    case 'azure-entra-id':
    // Azure - DevOps
    case 'azure-devops':
    case 'azure-repos':
    case 'azure-pipelines':
    case 'azure-boards':
    case 'azure-test-plans':
    case 'azure-artifacts':
    // Azure - Web
    case 'azure-static-web-apps':
    case 'azure-signalr':
    case 'azure-notification-hubs':
    // GCP Compute
    case 'gcp-compute':
    case 'gcp-functions':
    case 'gcp-app-engine':
    case 'gcp-cloud-run':
    case 'gcp-gke':
    // GCP Storage
    case 'gcp-storage':
    case 'gcp-persistent-disk':
    case 'gcp-filestore':
    case 'gcp-storage-transfer':
    // GCP Database
    case 'gcp-cloud-sql':
    case 'gcp-firestore':
    case 'gcp-bigtable':
    case 'gcp-spanner':
    case 'gcp-memorystore':
    case 'gcp-alloydb':
    // GCP Networking
    case 'gcp-vpc':
    case 'gcp-load-balancing':
    case 'gcp-cloud-cdn':
    case 'gcp-cloud-dns':
    case 'gcp-cloud-nat':
    case 'gcp-cloud-armor':
    case 'gcp-cloud-interconnect':
    case 'gcp-network-connectivity':
    // GCP Security
    case 'gcp-iam':
    case 'gcp-cloud-kms':
    case 'gcp-secret-manager':
    case 'gcp-security-command-center':
    case 'gcp-beyondcorp':
    case 'gcp-certificate-manager':
    // GCP Analytics
    case 'gcp-bigquery':
    case 'gcp-dataflow':
    case 'gcp-dataproc':
    case 'gcp-pubsub':
    case 'gcp-data-fusion':
    case 'gcp-looker':
    case 'gcp-dataform':
    // GCP AI/ML
    case 'gcp-vertex-ai':
    case 'gcp-vision-ai':
    case 'gcp-natural-language':
    case 'gcp-speech-to-text':
    case 'gcp-translation':
    case 'gcp-document-ai':
    case 'gcp-recommendations-ai':
    case 'gcp-automl':
    // GCP Developer
    case 'gcp-cloud-build':
    case 'gcp-artifact-registry':
    case 'gcp-cloud-source-repos':
    case 'gcp-cloud-deploy':
    case 'gcp-cloud-workstations':
    // GCP Management
    case 'gcp-cloud-monitoring':
    case 'gcp-cloud-logging':
    case 'gcp-cloud-trace':
    case 'gcp-error-reporting':
    case 'gcp-cloud-debugger':
    case 'gcp-cloud-profiler':
    // GCP Integration
    case 'gcp-cloud-tasks':
    case 'gcp-cloud-scheduler':
    case 'gcp-workflows':
    case 'gcp-eventarc':
    case 'gcp-api-gateway':
    // Generic
    case 'kubernetes':
    case 'docker':
    case 'generic-api':
    case 'generic-database':
    case 'generic-cache':
    case 'generic-queue':
    case 'generic-load-balancer':
    case 'generic-cdn':
    // Microsoft Office
    case 'office-word':
    case 'office-excel':
    case 'office-powerpoint':
    case 'office-outlook':
    case 'office-teams':
    case 'office-onedrive':
    case 'office-sharepoint':
    case 'office-onenote':
    case 'office-access':
    case 'office-publisher':
    case 'office-visio':
    case 'office-project': {
      const IconComponent = cloudIconComponents[type as CloudIconType]
      if (IconComponent) {
        return <IconComponent size={size} />
      }
      return null
    }

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="8" width="24" height="16" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )
  }
}


// Helper to count total shapes in a cloud provider
const countCloudProviderShapes = (subcategories: Record<string, { shapes: ShapeType[] }>) => {
  return Object.values(subcategories).reduce((total, sub) => total + sub.shapes.length, 0)
}

const collapsedShapes: { type: ShapeType; icon: React.ElementType; label: string }[] = [
  { type: 'rectangle', icon: Square, label: 'Rectangle' },
  { type: 'diamond', icon: Diamond, label: 'Diamond' },
  { type: 'circle', icon: Circle, label: 'Circle' },
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { type: 'note', icon: StickyNote, label: 'Note' },
  { type: 'table', icon: Table2, label: 'Table' },
]

export function ShapePanel() {
  const addNode = useEditorStore((state) => state.addNode)
  const shapePanelCollapsed = useEditorStore((state) => state.shapePanelCollapsed)
  const toggleShapePanel = useEditorStore((state) => state.toggleShapePanel)
  const [mainTab, setMainTab] = useState<'shapes' | 'images' | 'libraries'>('shapes')
  const [searchQuery, setSearchQuery] = useState('')
  // Start with empty array = all collapsed by default
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [expandedCloudProviders, setExpandedCloudProviders] = useState<string[]>([])
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([])
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false)
  const [expandedLibraries, setExpandedLibraries] = useState<string[]>([])

  // Fetch user's shape libraries
  const { data: shapeLibraries = [] } = useShapeLibraries()

  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: ShapeType) => {
      event.dataTransfer.setData('application/reactflow', nodeType)
      event.dataTransfer.effectAllowed = 'move'
    },
    []
  )

  const handleClick = useCallback(
    (shapeType: ShapeType) => {
      addNode(shapeType, { x: 250, y: 250 })
    },
    [addNode]
  )

  // Handle web image selection (click to add)
  const handleImageSelect = useCallback(
    (image: WebImageResult) => {
      const noBorder = image.type === 'icon' || image.type === 'gif'
      // Icons/GIFs: tight 48x48 square like cloud icons. Photos: 200px max.
      const maxSize = noBorder ? 48 : 200
      const aspectRatio = image.width / image.height
      let width = maxSize
      let height = maxSize
      if (!noBorder) {
        if (aspectRatio > 1) {
          height = maxSize / aspectRatio
        } else {
          width = maxSize * aspectRatio
        }
      }

      addNode('web-image', { x: 250, y: 250 }, {
        imageUrl: image.downloadUrl,
        thumbnailUrl: image.thumbnailUrl,
        imageType: image.type,
        imageAlt: image.alt,
        objectFit: noBorder ? 'contain' : 'cover',
        attribution: image.attribution,
        // Icons/GIFs get transparent background, no border (like cloud icons)
        ...(noBorder ? { style: { backgroundColor: 'transparent', borderWidth: 0, borderRadius: 0 } } : {}),
      }, { width, height })
    },
    [addNode]
  )

  // Filter shapes based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return SHAPE_CATEGORIES
    }

    const query = searchQuery.toLowerCase()
    const filtered: Partial<typeof SHAPE_CATEGORIES> = {}

    for (const [key, category] of Object.entries(SHAPE_CATEGORIES)) {
      const matchingShapes = category.shapes.filter((shape) => {
        const label = SHAPE_LABELS[shape] || shape
        return label.toLowerCase().includes(query) || shape.toLowerCase().includes(query)
      })

      if (matchingShapes.length > 0) {
        filtered[key as keyof typeof SHAPE_CATEGORIES] = {
          ...category,
          shapes: matchingShapes,
        }
      }
    }

    return filtered
  }, [searchQuery])

  // Filter cloud provider categories based on search query
  const filteredCloudCategories = useMemo(() => {
    type CloudProvider = {
      label: string
      icon: string
      subcategories: Record<string, { label: string; shapes: ShapeType[] }>
    }

    if (!searchQuery.trim()) {
      return CLOUD_PROVIDER_CATEGORIES as Record<string, CloudProvider>
    }

    const query = searchQuery.toLowerCase()
    const filtered: Record<string, CloudProvider> = {}

    for (const [providerKey, provider] of Object.entries(CLOUD_PROVIDER_CATEGORIES)) {
      const filteredSubcategories: Record<string, { label: string; shapes: ShapeType[] }> = {}

      for (const [subKey, subcategory] of Object.entries(provider.subcategories)) {
        const matchingShapes = subcategory.shapes.filter((shape: ShapeType) => {
          const label = SHAPE_LABELS[shape] || shape
          return label.toLowerCase().includes(query) || shape.toLowerCase().includes(query)
        })

        if (matchingShapes.length > 0) {
          filteredSubcategories[subKey] = {
            ...subcategory,
            shapes: matchingShapes,
          }
        }
      }

      if (Object.keys(filteredSubcategories).length > 0) {
        filtered[providerKey] = {
          ...provider,
          subcategories: filteredSubcategories,
        }
      }
    }

    return filtered
  }, [searchQuery])

  // Auto-expand categories when searching
  const effectiveExpanded = useMemo(() => {
    if (searchQuery.trim()) {
      return Object.keys(filteredCategories)
    }
    return expandedCategories
  }, [searchQuery, filteredCategories, expandedCategories])

  const effectiveCloudExpanded = useMemo(() => {
    if (searchQuery.trim()) {
      return Object.keys(filteredCloudCategories)
    }
    return expandedCloudProviders
  }, [searchQuery, filteredCloudCategories, expandedCloudProviders])

  const effectiveSubExpanded = useMemo(() => {
    if (searchQuery.trim()) {
      const allSubs: string[] = []
      for (const provider of Object.values(filteredCloudCategories)) {
        allSubs.push(...Object.keys(provider.subcategories))
      }
      return allSubs
    }
    return expandedSubcategories
  }, [searchQuery, filteredCloudCategories, expandedSubcategories])

  const renderShapeGrid = (shapes: ShapeType[]) => (
    <div className="grid grid-cols-3 gap-2 px-3">
      {shapes.map((shape) => (
        <Tooltip key={shape}>
          <TooltipTrigger asChild>
            <button
              className="aspect-square flex items-center justify-center border rounded-md hover:bg-accent hover:border-primary transition-colors cursor-grab active:cursor-grabbing p-1"
              draggable
              onDragStart={(e) => onDragStart(e, shape)}
              onClick={() => handleClick(shape)}
            >
              <ShapePreview type={shape} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2 p-2">
            <ShapePreview type={shape} />
            <span>{SHAPE_LABELS[shape]}</span>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )

  const hasResults = Object.keys(filteredCategories).length > 0 || Object.keys(filteredCloudCategories).length > 0

  if (shapePanelCollapsed) {
    return (
      <div className="w-12 border-r bg-background flex flex-col h-full items-center py-2 gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 mb-2" onClick={toggleShapePanel} title="Expand Library (Ctrl+B)">
          <ChevronRight className="h-4 w-4" />
        </Button>
        {collapsedShapes.map(({ type, icon: Icon, label }) => (
          <Tooltip key={type}>
            <TooltipTrigger asChild>
              <button
                className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent transition-colors cursor-grab"
                draggable
                onDragStart={(e) => onDragStart(e, type)}
                onClick={() => handleClick(type)}
              >
                <Icon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    )
  }

  return (
    <div className="w-64 border-r bg-background flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Library</h2>
          <p className="text-xs text-muted-foreground">Drag or click to add</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleShapePanel} title="Collapse Library (Ctrl+B)">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Main tabs: Shapes | Web Images | Libraries */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'shapes' | 'images' | 'libraries')} className="flex-1 flex flex-col">
        <div className="px-3 pt-2 border-b pb-2">
          <TabsList className="w-full grid grid-cols-3 h-9">
            <TabsTrigger value="shapes" className="text-xs">
              <Shapes className="w-3.5 h-3.5 mr-1.5" />
              Shapes
            </TabsTrigger>
            <TabsTrigger value="images" className="text-xs">
              <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
              Images
            </TabsTrigger>
            <TabsTrigger value="libraries" className="text-xs">
              <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
              Custom
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Shapes Tab Content */}
        <TabsContent value="shapes" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search shapes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* Shape categories with accordion */}
          <ScrollArea className="flex-1">
            {/* Basic shape categories */}
            <Accordion
              type="multiple"
              value={effectiveExpanded}
              onValueChange={setExpandedCategories}
              className="w-full"
            >
              {Object.entries(filteredCategories).map(([key, category]) => (
                <AccordionItem key={key} value={key} className="border-b last:border-0">
                  <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline hover:bg-accent/50">
                    <span className="flex items-center gap-2">
                      {category.label}
                      <span className="text-xs text-muted-foreground">
                        ({category.shapes.length})
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    {renderShapeGrid(category.shapes)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Cloud Provider Categories */}
            {Object.keys(filteredCloudCategories).length > 0 && (
              <Accordion
                type="multiple"
                value={effectiveCloudExpanded}
                onValueChange={setExpandedCloudProviders}
                className="w-full"
              >
                {Object.entries(filteredCloudCategories).map(([providerKey, provider]) => (
                  <AccordionItem key={providerKey} value={providerKey} className="border-b last:border-0">
                    <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline hover:bg-accent/50">
                      <span className="flex items-center gap-2">
                        {provider.label}
                        <span className="text-xs text-muted-foreground">
                          ({countCloudProviderShapes(provider.subcategories)})
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                      {/* Nested subcategories */}
                      <Accordion
                        type="multiple"
                        value={effectiveSubExpanded}
                        onValueChange={setExpandedSubcategories}
                        className="w-full"
                      >
                        {Object.entries(provider.subcategories).map(([subKey, subcategory]) => (
                          <AccordionItem key={subKey} value={subKey} className="border-0">
                            <AccordionTrigger className="px-6 py-1.5 text-sm hover:no-underline hover:bg-accent/30">
                              <span className="flex items-center gap-2">
                                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                {subcategory.label}
                                <span className="text-xs text-muted-foreground">
                                  ({subcategory.shapes.length})
                                </span>
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-2 pl-2">
                              {renderShapeGrid(subcategory.shapes)}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            {!hasResults && searchQuery && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No shapes found for "{searchQuery}"
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Web Images Tab Content */}
        <TabsContent value="images" className="flex-1 mt-0 data-[state=inactive]:hidden">
          <WebImageSearch onImageSelect={handleImageSelect} />
        </TabsContent>

        {/* Libraries Tab Content */}
        <TabsContent value="libraries" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
          <div className="p-3 border-b">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setLibraryDialogOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Libraries
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {shapeLibraries.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <p>No custom shape libraries yet.</p>
                <p className="mt-1">Click "Manage Libraries" to create one.</p>
              </div>
            ) : (
              <Accordion
                type="multiple"
                value={expandedLibraries}
                onValueChange={setExpandedLibraries}
                className="w-full"
              >
                {shapeLibraries.map((library) => (
                  <LibraryShapeCategory
                    key={library.id}
                    libraryId={library.id}
                    libraryName={library.name}
                    onDragStart={onDragStart}
                    addNode={addNode}
                  />
                ))}
              </Accordion>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Shape Library Dialog */}
      <ShapeLibraryDialog
        open={libraryDialogOpen}
        onOpenChange={setLibraryDialogOpen}
      />
    </div>
  )
}

// Component to render shapes from a library
interface LibraryShapeCategoryProps {
  libraryId: string
  libraryName: string
  onDragStart: (event: React.DragEvent, nodeType: ShapeType) => void
  addNode: (type: ShapeType, position: { x: number; y: number }, data?: Record<string, unknown>, size?: { width: number; height: number }) => void
}

function LibraryShapeCategory({ libraryId, libraryName, onDragStart: _onDragStart, addNode }: LibraryShapeCategoryProps) {
  const { data: shapes = [] } = useShapesByLibrary(libraryId)

  const handleCustomShapeDrag = useCallback((e: React.DragEvent, shape: CustomShape) => {
    // Store custom shape data in drag transfer
    e.dataTransfer.setData('application/reactflow', 'custom-shape')
    e.dataTransfer.setData('application/custom-shape', JSON.stringify({
      id: shape.id,
      name: shape.name,
      svgContent: shape.svgContent,
    }))
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleCustomShapeClick = useCallback((shape: CustomShape) => {
    // Add custom shape as a node with embedded SVG
    addNode('custom-shape' as ShapeType, { x: 250, y: 250 }, {
      customShapeId: shape.id,
      customShapeName: shape.name,
      customShapeSvg: shape.svgContent,
    }, { width: 64, height: 64 })
  }, [addNode])

  if (shapes.length === 0) {
    return (
      <AccordionItem value={libraryId} className="border-b last:border-0">
        <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline hover:bg-accent/50">
          <span className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            {libraryName}
            <span className="text-xs text-muted-foreground">(0)</span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-3 px-4">
          <p className="text-xs text-muted-foreground text-center py-2">
            No shapes in this library
          </p>
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <AccordionItem value={libraryId} className="border-b last:border-0">
      <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline hover:bg-accent/50">
        <span className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          {libraryName}
          <span className="text-xs text-muted-foreground">({shapes.length})</span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-3">
        <div className="grid grid-cols-3 gap-2 px-3">
          {shapes.map((shape) => (
            <Tooltip key={shape.id}>
              <TooltipTrigger asChild>
                <button
                  className="aspect-square flex items-center justify-center border rounded-md hover:bg-accent hover:border-primary transition-colors cursor-grab active:cursor-grabbing p-1 overflow-hidden"
                  draggable
                  onDragStart={(e) => handleCustomShapeDrag(e, shape)}
                  onClick={() => handleCustomShapeClick(shape)}
                >
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: shape.svgContent }}
                    style={{ maxWidth: 32, maxHeight: 32 }}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span>{shape.name}</span>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
