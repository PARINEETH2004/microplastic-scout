import { useState } from 'react';
import type { Detection, DetectionResult } from '@/types/detection';
import { getParticleColor } from '@/lib/mockDetection';
import { cn } from '@/lib/utils';

interface DetectionOverlayProps {
  result: DetectionResult;
  selectedDetection: Detection | null;
  onSelectDetection: (detection: Detection | null) => void;
}

export function DetectionOverlay({ 
  result, 
  selectedDetection, 
  onSelectDetection 
}: DetectionOverlayProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  return (
    <div className="relative bg-muted rounded-xl overflow-hidden">
      <img
        src={result.imageUrl}
        alt="Analysis result"
        className="w-full h-auto"
        onLoad={handleImageLoad}
      />
      
      {/* Bounding box overlays */}
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${imageSize.width || 640} ${imageSize.height || 480}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {result.detections.map((det) => (
          <g key={det.id}>
            {/* Bounding box */}
            <rect
              x={det.boundingBox.x}
              y={det.boundingBox.y}
              width={det.boundingBox.width}
              height={det.boundingBox.height}
              fill="transparent"
              stroke={getParticleColor(det.particleType)}
              strokeWidth={selectedDetection?.id === det.id ? 3 : 2}
              className={cn(
                "cursor-pointer transition-all",
                selectedDetection?.id === det.id && "animate-pulse"
              )}
              onClick={() => onSelectDetection(det)}
            />
            
            {/* Label background */}
            <rect
              x={det.boundingBox.x}
              y={det.boundingBox.y - 20}
              width={det.boundingBox.width}
              height={18}
              fill={getParticleColor(det.particleType)}
              rx={2}
            />
            
            {/* Label text */}
            <text
              x={det.boundingBox.x + 4}
              y={det.boundingBox.y - 6}
              fill="white"
              fontSize="10"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
            >
              {det.particleType} {(det.confidence * 100).toFixed(0)}%
            </text>
          </g>
        ))}
      </svg>
      
      {/* Click hint */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full glass-panel text-xs text-muted-foreground">
        Click on a detection to view LDIR spectrum
      </div>
    </div>
  );
}
