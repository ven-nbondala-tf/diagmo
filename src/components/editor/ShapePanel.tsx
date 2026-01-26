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
} from '@/components/ui'
import { SHAPE_CATEGORIES, SHAPE_LABELS } from '@/constants'
import type { ShapeType } from '@/types'
import { Search } from 'lucide-react'

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

    // ===== AWS ICONS =====
    case 'aws-ec2':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#FF9900" />
          <rect x="8" y="8" width="16" height="4" rx="0.5" fill="white" />
          <rect x="8" y="14" width="16" height="4" rx="0.5" fill="white" />
          <rect x="8" y="20" width="16" height="4" rx="0.5" fill="white" />
          <circle cx="11" cy="10" r="1" fill="#FF9900" />
          <circle cx="11" cy="16" r="1" fill="#FF9900" />
          <circle cx="11" cy="22" r="1" fill="#FF9900" />
        </svg>
      )

    case 'aws-s3':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#569A31" />
          <path d="M10,10 L22,10 L20,24 L12,24 Z" fill="white" />
          <ellipse cx="16" cy="10" rx="6" ry="2" fill="white" />
        </svg>
      )

    case 'aws-lambda':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#FF9900" />
          <path d="M10,24 L16,8 L18,8 L14,18 L22,18 L22,20 L13,20 L10,24 Z" fill="white" />
        </svg>
      )

    case 'aws-rds':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#3B48CC" />
          <ellipse cx="16" cy="10" rx="7" ry="3" fill="white" />
          <path d="M9,10 L9,22 C9,24 12,26 16,26 C20,26 23,24 23,22 L23,10" fill="none" stroke="white" strokeWidth="2" />
        </svg>
      )

    case 'aws-dynamodb':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#4053D6" />
          <ellipse cx="16" cy="10" rx="7" ry="2.5" fill="white" />
          <ellipse cx="16" cy="16" rx="7" ry="2.5" fill="none" stroke="white" strokeWidth="1.5" />
          <ellipse cx="16" cy="22" rx="7" ry="2.5" fill="white" />
          <line x1="9" y1="10" x2="9" y2="22" stroke="white" strokeWidth="1.5" />
          <line x1="23" y1="10" x2="23" y2="22" stroke="white" strokeWidth="1.5" />
        </svg>
      )

    case 'aws-api-gateway':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#FF4F8B" />
          <rect x="12" y="8" width="8" height="16" rx="1" fill="white" />
          <path d="M8,12 L12,12" stroke="white" strokeWidth="2" />
          <path d="M8,16 L12,16" stroke="white" strokeWidth="2" />
          <path d="M8,20 L12,20" stroke="white" strokeWidth="2" />
          <path d="M20,12 L24,12" stroke="white" strokeWidth="2" />
          <path d="M20,16 L24,16" stroke="white" strokeWidth="2" />
          <path d="M20,20 L24,20" stroke="white" strokeWidth="2" />
        </svg>
      )

    case 'aws-sns':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#FF4F8B" />
          <circle cx="16" cy="16" r="4" fill="white" />
          <path d="M16,8 L16,12" stroke="white" strokeWidth="2" />
          <path d="M16,20 L16,24" stroke="white" strokeWidth="2" />
          <path d="M8,16 L12,16" stroke="white" strokeWidth="2" />
          <path d="M20,16 L24,16" stroke="white" strokeWidth="2" />
        </svg>
      )

    case 'aws-sqs':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#FF4F8B" />
          <rect x="8" y="10" width="6" height="12" rx="1" fill="white" />
          <rect x="16" y="10" width="8" height="12" rx="1" fill="none" stroke="white" strokeWidth="1.5" />
          <path d="M14,16 L16,16" stroke="white" strokeWidth="2" />
        </svg>
      )

    case 'aws-cloudfront':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#8C4FFF" />
          <circle cx="16" cy="16" r="8" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="16" cy="16" r="4" fill="white" />
          <path d="M16,4 L16,8" stroke="white" strokeWidth="2" />
          <path d="M16,24 L16,28" stroke="white" strokeWidth="2" />
        </svg>
      )

    case 'aws-route53':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#8C4FFF" />
          <circle cx="16" cy="16" r="8" fill="none" stroke="white" strokeWidth="2" />
          <ellipse cx="16" cy="16" rx="4" ry="8" fill="none" stroke="white" strokeWidth="1.5" />
          <line x1="8" y1="16" x2="24" y2="16" stroke="white" strokeWidth="1.5" />
        </svg>
      )

    case 'aws-vpc':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#8C4FFF" />
          <rect x="8" y="8" width="16" height="16" rx="2" fill="none" stroke="white" strokeWidth="2" />
          <rect x="11" y="11" width="10" height="10" rx="1" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="2,2" />
        </svg>
      )

    case 'aws-iam':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#DD344C" />
          <circle cx="16" cy="12" r="4" fill="white" />
          <path d="M10,24 C10,20 12,18 16,18 C20,18 22,20 22,24" fill="white" />
          <rect x="14" y="20" width="4" height="6" fill="#DD344C" />
        </svg>
      )

    case 'aws-ecs':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#FF9900" />
          <rect x="8" y="8" width="7" height="7" rx="1" fill="white" />
          <rect x="17" y="8" width="7" height="7" rx="1" fill="white" />
          <rect x="8" y="17" width="7" height="7" rx="1" fill="white" />
          <rect x="17" y="17" width="7" height="7" rx="1" fill="white" />
        </svg>
      )

    case 'aws-eks':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#FF9900" />
          <circle cx="16" cy="16" r="8" fill="none" stroke="white" strokeWidth="2" />
          <path d="M16,8 L16,24 M8,16 L24,16 M10,10 L22,22 M22,10 L10,22" stroke="white" strokeWidth="1.5" />
        </svg>
      )

    // ===== AZURE ICONS =====
    case 'azure-vm':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#0078D4" />
          <rect x="8" y="8" width="16" height="12" rx="1" fill="white" />
          <rect x="12" y="21" width="8" height="1.5" fill="white" />
          <rect x="10" y="23" width="12" height="1.5" fill="white" />
        </svg>
      )

    case 'azure-storage':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#0078D4" />
          <rect x="8" y="8" width="16" height="4" rx="0.5" fill="white" />
          <rect x="8" y="14" width="16" height="4" rx="0.5" fill="white" />
          <rect x="8" y="20" width="16" height="4" rx="0.5" fill="white" />
        </svg>
      )

    case 'azure-functions':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#0062AD" />
          <path d="M18,6 L12,16 L16,16 L14,26 L22,14 L17,14 L20,6 Z" fill="#FFC107" />
        </svg>
      )

    case 'azure-sql':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#0078D4" />
          <ellipse cx="16" cy="10" rx="7" ry="3" fill="white" />
          <path d="M9,10 L9,22 C9,24 12,26 16,26 C20,26 23,24 23,22 L23,10" fill="none" stroke="white" strokeWidth="2" />
        </svg>
      )

    case 'azure-cosmos':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#0078D4" />
          <circle cx="16" cy="16" r="7" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="16" cy="16" r="3" fill="white" />
          <circle cx="11" cy="12" r="2" fill="white" />
          <circle cx="21" cy="20" r="2" fill="white" />
        </svg>
      )

    case 'azure-app-service':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#0078D4" />
          <rect x="8" y="8" width="16" height="16" rx="2" fill="white" />
          <path d="M12,14 L20,14 M12,18 L18,18 M12,22 L16,22" stroke="#0078D4" strokeWidth="1.5" />
        </svg>
      )

    case 'azure-aks':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#326CE5" />
          <circle cx="16" cy="16" r="8" fill="none" stroke="white" strokeWidth="2" />
          <path d="M16,8 L16,24 M8,16 L24,16 M10,10 L22,22 M22,10 L10,22" stroke="white" strokeWidth="1.5" />
        </svg>
      )

    case 'azure-cdn':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#0078D4" />
          <circle cx="16" cy="16" r="8" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="16" cy="16" r="4" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="1" fill="white" />
        </svg>
      )

    case 'azure-vnet':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#0078D4" />
          <rect x="8" y="8" width="16" height="16" rx="2" fill="none" stroke="white" strokeWidth="2" />
          <line x1="8" y1="16" x2="24" y2="16" stroke="white" strokeWidth="1.5" />
          <line x1="16" y1="8" x2="16" y2="24" stroke="white" strokeWidth="1.5" />
        </svg>
      )

    case 'azure-keyvault':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#0078D4" />
          <circle cx="16" cy="14" r="4" fill="none" stroke="white" strokeWidth="2" />
          <rect x="14" y="18" width="4" height="8" fill="white" />
          <rect x="13" y="22" width="6" height="2" fill="white" />
        </svg>
      )

    // ===== GCP ICONS =====
    case 'gcp-compute':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#4285F4" />
          <rect x="8" y="10" width="16" height="12" rx="1" fill="white" />
          <rect x="10" y="12" width="4" height="3" fill="#4285F4" />
          <rect x="10" y="17" width="4" height="3" fill="#4285F4" />
          <rect x="16" y="12" width="6" height="8" fill="#4285F4" />
        </svg>
      )

    case 'gcp-storage':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#4285F4" />
          <ellipse cx="16" cy="10" rx="8" ry="3" fill="white" />
          <path d="M8,10 L8,22 C8,24 11,26 16,26 C21,26 24,24 24,22 L24,10" fill="white" />
          <line x1="8" y1="14" x2="24" y2="14" stroke="#4285F4" strokeWidth="1" />
          <line x1="8" y1="18" x2="24" y2="18" stroke="#4285F4" strokeWidth="1" />
        </svg>
      )

    case 'gcp-functions':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#4285F4" />
          <text x="16" y="21" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">ƒ</text>
        </svg>
      )

    case 'gcp-bigquery':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#4285F4" />
          <rect x="8" y="8" width="4" height="16" fill="white" />
          <rect x="14" y="12" width="4" height="12" fill="white" />
          <rect x="20" y="16" width="4" height="8" fill="white" />
        </svg>
      )

    case 'gcp-pubsub':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#4285F4" />
          <circle cx="10" cy="16" r="3" fill="white" />
          <circle cx="22" cy="10" r="3" fill="white" />
          <circle cx="22" cy="22" r="3" fill="white" />
          <line x1="13" y1="15" x2="19" y2="11" stroke="white" strokeWidth="2" />
          <line x1="13" y1="17" x2="19" y2="21" stroke="white" strokeWidth="2" />
        </svg>
      )

    case 'gcp-gke':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#4285F4" />
          <circle cx="16" cy="16" r="8" fill="none" stroke="white" strokeWidth="2" />
          <path d="M16,8 L16,24 M8,16 L24,16 M10,10 L22,22 M22,10 L10,22" stroke="white" strokeWidth="1.5" />
        </svg>
      )

    case 'gcp-cloud-run':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#4285F4" />
          <path d="M10,20 L16,8 L22,20 Z" fill="none" stroke="white" strokeWidth="2" />
          <path d="M14,20 L16,24 L18,20" fill="white" />
        </svg>
      )

    case 'gcp-firestore':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#FFCA28" />
          <path d="M10,8 L16,20 L10,24 Z" fill="white" />
          <path d="M22,8 L16,20 L22,24 Z" fill="white" opacity="0.7" />
        </svg>
      )

    case 'gcp-cloud-sql':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill="#4285F4" />
          <ellipse cx="16" cy="10" rx="7" ry="3" fill="white" />
          <path d="M9,10 L9,22 C9,24 12,26 16,26 C20,26 23,24 23,22 L23,10" fill="none" stroke="white" strokeWidth="2" />
          <ellipse cx="16" cy="16" rx="7" ry="2" fill="none" stroke="white" strokeWidth="1" />
        </svg>
      )

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="8" width="24" height="16" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )
  }
}

export function ShapePanel() {
  const addNode = useEditorStore((state) => state.addNode)
  const [searchQuery, setSearchQuery] = useState('')
  // Start with empty array = all collapsed by default
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

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

  // Auto-expand categories when searching
  const effectiveExpanded = useMemo(() => {
    if (searchQuery.trim()) {
      return Object.keys(filteredCategories)
    }
    return expandedCategories
  }, [searchQuery, filteredCategories, expandedCategories])

  return (
    <div className="w-64 border-r bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold">Shapes</h2>
        <p className="text-xs text-muted-foreground">Drag or click to add</p>
      </div>

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
                <div className="grid grid-cols-3 gap-2 px-3">
                  {category.shapes.map((shape) => (
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {Object.keys(filteredCategories).length === 0 && searchQuery && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No shapes found for "{searchQuery}"
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
