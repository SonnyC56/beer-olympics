import { useEffect, useRef, useState } from 'react';
// import { QrReader } from 'react-qr-reader'; // Missing module - commented out
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { authEnhanced } from '@/services/auth-enhanced';
import { toast } from 'sonner';

interface QRScannerProps {
  onScanSuccess: (data: { teamId: string; tournamentId: string }) => void;
  onClose: () => void;
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  // const lastScannedRef = useRef<string>('');

  useEffect(() => {
    // Check camera permissions
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

  // Commented out handleScan as QR reader is not available
  // const _handleScan = async (result: any) => {
  //   if (!result || isProcessing) return;
  //   ...
  // };

  const handleManualEntry = async () => {
    if (!manualCode.trim() || isProcessing) return;

    setIsProcessing(true);

    try {
      const result = await authEnhanced.useInvite(manualCode.trim(), 'current-user-id'); // TODO: Get actual user ID

      if (result.success && result.teamId && result.tournamentId) {
        toast.success('Successfully joined team!');
        onScanSuccess({
          teamId: result.teamId,
          tournamentId: result.tournamentId
        });
      } else {
        throw new Error(result.error || 'Failed to join team');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid invite code');
      setIsProcessing(false);
    }
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card 
        className="relative w-full max-w-md bg-gray-900 border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-full mb-4">
              <QrCode className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Join Team</h2>
            <p className="text-gray-400">
              Scan QR code or enter invite code
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isScanning && hasPermission ? (
              <motion.div
                key="scanner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-800 mb-4"
              >
                {isProcessing && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
                      <p className="text-white">Processing...</p>
                    </div>
                  </div>
                )}
                
                {/* QR Reader commented out due to missing module
                <QrReader
                  onResult={handleScan}
                  constraints={{ facingMode: 'environment' }}
                  className="w-full h-full"
                />
                */}
                
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">QR Scanner temporarily unavailable</p>
                  <p className="text-sm text-gray-500">Please enter invite code manually</p>
                </div>
                
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-amber-500 rounded-lg">
                    <div className="absolute -top-px -left-px w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-lg" />
                    <div className="absolute -top-px -right-px w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-lg" />
                    <div className="absolute -bottom-px -left-px w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-lg" />
                    <div className="absolute -bottom-px -right-px w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-lg" />
                  </div>
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
                  Enter invite code manually below
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-500">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Enter invite code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                disabled={isProcessing}
              />
              
              <Button
                onClick={handleManualEntry}
                disabled={!manualCode.trim() || isProcessing}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Join Team'
                )}
              </Button>
            </div>

            {hasPermission && (
              <Button
                variant="outline"
                onClick={() => setIsScanning(!isScanning)}
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                {isScanning ? 'Enter Code Manually' : 'Scan QR Code'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}