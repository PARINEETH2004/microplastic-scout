import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, X, Zap, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DetectionMode } from '@/types/detection';
import sampleImage from '@/assets/sample-microscopy.jpg';

interface ImageUploadProps {
  onAnalyze: (file: File, mode: DetectionMode) => void;
  isProcessing: boolean;
}

export function ImageUpload({ onAnalyze, isProcessing }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detectionMode, setDetectionMode] = useState<DetectionMode>('fast');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (selectedFile) {
      onAnalyze(selectedFile, detectionMode);
    }
  }, [selectedFile, detectionMode, onAnalyze]);

  const loadSampleImage = useCallback(async () => {
    try {
      const response = await fetch(sampleImage);
      const blob = await response.blob();
      const file = new File([blob], 'sample-microscopy.jpg', { type: 'image/jpeg' });
      handleFileSelect(file);
    } catch (error) {
      console.error('Failed to load sample image:', error);
    }
  }, [handleFileSelect]);

  return (
    <section id="upload-section" className="py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Section header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Upload Image</h2>
            <p className="text-muted-foreground">
              Select a microscopy image (JPG, PNG) to analyze for microplastic particles
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer",
                isDragOver 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 hover:bg-muted/30",
                previewUrl && "border-solid border-primary/30"
              )}
            >
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-contain rounded-lg bg-muted"
                  />
                  <button
                    onClick={clearSelection}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="mt-4 text-center">
                    <p className="font-medium text-foreground">{selectedFile?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile && (selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-64 cursor-pointer">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-1">
                    Drop your image here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    Supports JPG, PNG up to 10MB
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              )}
              
              {/* Sample image button */}
              {!previewUrl && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={loadSampleImage}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Try sample image
                  </Button>
                </div>
              )}
            </div>

            {/* Detection mode selection */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Detection Mode</h3>
                
                {/* Fast mode */}
                <button
                  onClick={() => setDetectionMode('fast')}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                    detectionMode === 'fast'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      detectionMode === 'fast' ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">Fast Mode</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        YOLOv11 only — Quick results in ~2 seconds
                      </p>
                    </div>
                    {detectionMode === 'fast' && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                </button>

                {/* Accurate mode */}
                <button
                  onClick={() => setDetectionMode('accurate')}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                    detectionMode === 'accurate'
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/30 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      detectionMode === 'accurate' ? "bg-accent text-accent-foreground" : "bg-muted"
                    )}>
                      <Target className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">Accurate Mode</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        YOLOv11 + Faster R-CNN — Better precision, ~5 seconds
                      </p>
                    </div>
                    {detectionMode === 'accurate' && (
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    )}
                  </div>
                </button>
              </div>

              {/* Analyze button */}
              <Button
                variant="hero"
                size="lg"
                onClick={handleAnalyze}
                disabled={!selectedFile || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Start Analysis
                  </>
                )}
              </Button>

              {/* Info */}
              <p className="text-xs text-center text-muted-foreground">
                Detection includes simulated LDIR spectroscopy for polymer identification
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
