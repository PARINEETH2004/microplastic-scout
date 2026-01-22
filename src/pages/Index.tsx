import { useState, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ImageUpload } from '@/components/ImageUpload';
import { ResultsSection } from '@/components/ResultsSection';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { Footer } from '@/components/Footer';
import { simulateDetection } from '@/lib/mockDetection';
import type { DetectionResult, DetectionMode } from '@/types/detection';

const Index = () => {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMode, setProcessingMode] = useState<DetectionMode>('fast');
  const uploadRef = useRef<HTMLDivElement>(null);

  const scrollToUpload = useCallback(() => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleAnalyze = useCallback(async (file: File, mode: DetectionMode) => {
    setIsProcessing(true);
    setProcessingMode(mode);

    try {
      const imageUrl = URL.createObjectURL(file);
      const detectionResult = await simulateDetection(imageUrl, file.name, mode);
      setResult(detectionResult);
    } catch (error) {
      console.error('Detection failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {!result ? (
        <>
          <HeroSection onScrollToUpload={scrollToUpload} />
          <div ref={uploadRef}>
            <ImageUpload onAnalyze={handleAnalyze} isProcessing={isProcessing} />
          </div>
        </>
      ) : (
        <div className="pt-16">
          <ResultsSection result={result} onReset={handleReset} />
        </div>
      )}
      
      <Footer />
      
      {isProcessing && <ProcessingOverlay mode={processingMode} />}
    </div>
  );
};

export default Index;
