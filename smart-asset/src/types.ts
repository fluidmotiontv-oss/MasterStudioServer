export interface ColorBucket {
  hex: string;
  rgb: [number, number, number];
  percentage: number;
  name: string;
}

export interface PhysicsConfig {
  type: 'float' | 'tilt3d' | 'bounce' | 'magnetic' | 'particle' | 'pulse' | 'orbit';
  stiffness: number;
  damping: number;
  mass: number;
  scaleOnHover: number;
  tiltAmount: number;
  enableParticles: boolean;
  particleColor?: string;
  enableSound: boolean;
  soundType: 'pop' | 'chime' | 'click' | 'hum' | 'laser' | 'crystal';
  glowColor: string;
  glowBlur: number;
}

export interface SmartLayer {
  id: string;
  name: string;
  type: 'subject' | 'background' | 'shadow' | 'glow' | 'vector';
  dataUrl: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
}

export interface VectorTraceResult {
  svgContent: string;
  pathCount: number;
  viewBox: string;
  simplifiedPaths: string[];
}

export interface AIAnalysisResult {
  title: string;
  category: string;
  description: string;
  dominantColors: ColorBucket[];
  tags: string[];
  suggestedPhysics: PhysicsConfig['type'];
  altText: string;
  recommendedStyles: string[];
  thinkingProcess?: string;
  codeSnippet?: string;
}

export interface SmartAsset {
  id: string;
  name: string;
  originalUrl: string;
  width: number;
  height: number;
  category: string;
  analysis?: AIAnalysisResult;
  physics: PhysicsConfig;
  layers: SmartLayer[];
  vectorTrace?: VectorTraceResult;
  createdAt: number;
  driveFileId?: string;
}

export interface ImageGenOptions {
  prompt: string;
  style: string;
  resolution: '1K' | '2K' | '4K';
  aspectRatio: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  iconLink?: string;
}
