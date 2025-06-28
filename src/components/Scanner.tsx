
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Scan, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ScannerProps {
  onScanComplete: (barcode: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onClose }) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      toast({
        title: "Camera started",
        description: "Point your camera at a barcode or QR code"
      });
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please enter barcode manually.",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScanComplete(manualCode.trim());
      toast({
        title: "Barcode Added",
        description: `Barcode ${manualCode} has been captured`
      });
    }
  };

  const simulateSuccessfulScan = () => {
    const sampleBarcode = '8901030' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    onScanComplete(sampleBarcode);
    stopCamera();
    toast({
      title: "Scan Successful!",
      description: `Captured barcode: ${sampleBarcode}`
    });
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scanner
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              stopCamera();
              onClose();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isScanning ? (
            <div className="space-y-4">
              <Button
                onClick={startCamera}
                className="w-full"
                size="lg"
              >
                <Scan className="mr-2 h-4 w-4" />
                Start Camera Scanner
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or enter manually
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-code">Barcode/QR Code</Label>
                <Input
                  id="manual-code"
                  placeholder="Enter barcode or QR code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
                <Button
                  onClick={handleManualSubmit}
                  disabled={!manualCode.trim()}
                  className="w-full"
                >
                  Add Barcode
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video"
                />
                <div className="absolute inset-0 border-2 border-primary rounded-lg">
                  <div className="scanner-overlay absolute inset-0"></div>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <p className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                    Point camera at barcode
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={simulateSuccessfulScan}
                  className="flex-1"
                  variant="outline"
                >
                  Simulate Scan
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1"
                >
                  Stop Camera
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Scanner;
