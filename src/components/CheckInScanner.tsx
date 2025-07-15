import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Smartphone,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CheckInScannerProps {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
  kioskMode?: boolean;
}

export function CheckInScanner({ onScanSuccess, onClose, kioskMode = false }: CheckInScannerProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastScanned, setLastScanned] = useState<string>('');
  const [recentCheckins, setRecentCheckins] = useState<Array<{
    name: string;
    time: Date;
    team?: string;
  }>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check camera permissions and start video stream
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (error) {
        console.error('Camera access denied:', error);
        setHasPermission(false);
      }
    };

    startCamera();

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleManualEntry = async () => {
    if (!manualCode.trim() || isProcessing) return;

    setIsProcessing(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Process the check-in code
      onScanSuccess(manualCode.trim());
      
      // Clear the input for next scan
      setManualCode('');
      
      // Show success feedback
      if (kioskMode) {
        // In kiosk mode, show a larger success message
        toast.custom(() => (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-500 text-white p-6 rounded-2xl shadow-2xl"
          >
            <CheckCircle2 className="w-16 h-16 mx-auto mb-2" />
            <p className="text-2xl font-bold text-center">Check-in Successful!</p>
          </motion.div>
        ),
          { duration: 3000 }
        );
      }
    } catch (error) {
      toast.error('Invalid check-in code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQRDetected = (data: string) => {
    if (data === lastScanned || isProcessing) return;
    
    setLastScanned(data);
    setIsProcessing(true);
    
    // Vibrate if available (mobile devices)
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
    
    onScanSuccess(data);
    
    // Reset after delay to allow new scans
    setTimeout(() => {
      setIsProcessing(false);
      setLastScanned('');
    }, 3000);
  };

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        kioskMode ? "bg-gray-900" : "bg-black/80 backdrop-blur-sm p-4"
      )}
      onClick={!kioskMode ? onClose : undefined}
    >
      <Card 
        className={cn(
          "relative bg-gray-900 border-gray-800",
          kioskMode ? "w-full h-full rounded-none" : "w-full max-w-md"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {!kioskMode && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className={cn("p-6", kioskMode && "h-full flex flex-col")}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-full mb-4">
              <UserCheck className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className={cn(
              "font-bold text-white mb-2",
              kioskMode ? "text-4xl" : "text-2xl"
            )}>
              {kioskMode ? 'Self Check-In' : 'Check-In Scanner'}
            </h2>
            <p className={cn(
              "text-gray-400",
              kioskMode && "text-lg"
            )}>
              Scan QR code from your RSVP email
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isScanning && hasPermission ? (
              <motion.div
                key="scanner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "relative rounded-lg overflow-hidden bg-gray-800 mb-4",
                  kioskMode ? "flex-1" : "aspect-square"
                )}
              >
                {isProcessing && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-2" />
                      <p className="text-white text-xl">Processing check-in...</p>
                    </div>
                  </div>
                )}
                
                {/* Video feed for QR scanning */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* QR Scanner overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className={cn(
                    "absolute border-2 border-amber-500 rounded-lg",
                    kioskMode 
                      ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96"
                      : "inset-8"
                  )}>
                    <div className="absolute -top-px -left-px w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-lg" />
                    <div className="absolute -top-px -right-px w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-lg" />
                    <div className="absolute -bottom-px -left-px w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-lg" />
                    <div className="absolute -bottom-px -right-px w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-lg" />
                  </div>
                  
                  {kioskMode && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                      <p className="text-white text-xl mb-2">Position QR code within frame</p>
                      <p className="text-gray-400">Hold steady for automatic scanning</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-800 rounded-lg p-8 text-center mb-4"
              >
                <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">
                  {hasPermission === false 
                    ? 'Camera permission denied' 
                    : 'Camera not available'}
                </p>
                <p className="text-sm text-gray-500">
                  Enter your check-in code manually below
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={cn("space-y-4", kioskMode && "mt-auto")}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-500">or enter code</span>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                placeholder={kioskMode ? "Enter your check-in code" : "Enter check-in code"}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
                className={cn(
                  "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500",
                  kioskMode && "text-xl py-6"
                )}
                disabled={isProcessing}
              />
              
              <Button
                onClick={handleManualEntry}
                disabled={!manualCode.trim() || isProcessing}
                className={cn(
                  "w-full bg-amber-500 hover:bg-amber-600 text-white",
                  kioskMode && "text-xl py-6"
                )}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Check In
                  </>
                )}
              </Button>
            </div>

            {hasPermission && !kioskMode && (
              <Button
                variant="outline"
                onClick={() => setIsScanning(!isScanning)}
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                {isScanning ? 'Enter Code Manually' : 'Scan QR Code'}
              </Button>
            )}
          </div>

          {/* Recent check-ins (kiosk mode only) */}
          {kioskMode && recentCheckins.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Check-ins</h3>
              <div className="space-y-2">
                {recentCheckins.slice(0, 5).map((checkin, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-400">
                      {checkin.name}
                      {checkin.team && (
                        <span className="text-amber-500 ml-2">• {checkin.team}</span>
                      )}
                    </span>
                    <span className="text-gray-500">
                      {checkin.time.toLocaleTimeString()}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}