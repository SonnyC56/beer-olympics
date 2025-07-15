import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, Camera, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
export function CheckInScanner({ onScanSuccess, onClose, kioskMode = false }) {
    const [isScanning, setIsScanning] = useState(true);
    const [manualCode, setManualCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [lastScanned, setLastScanned] = useState('');
    const [recentCheckins, setRecentCheckins] = useState([]);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
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
            }
            catch (error) {
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
        if (!manualCode.trim() || isProcessing)
            return;
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
                toast.custom(() => (_jsxs(motion.div, { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, className: "bg-green-500 text-white p-6 rounded-2xl shadow-2xl", children: [_jsx(CheckCircle2, { className: "w-16 h-16 mx-auto mb-2" }), _jsx("p", { className: "text-2xl font-bold text-center", children: "Check-in Successful!" })] })), { duration: 3000 });
            }
        }
        catch (error) {
            toast.error('Invalid check-in code');
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleQRDetected = (data) => {
        if (data === lastScanned || isProcessing)
            return;
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
        return (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-amber-500" }) }));
    }
    return (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: cn("fixed inset-0 z-50 flex items-center justify-center", kioskMode ? "bg-gray-900" : "bg-black/80 backdrop-blur-sm p-4"), onClick: !kioskMode ? onClose : undefined, children: _jsxs(Card, { className: cn("relative bg-gray-900 border-gray-800", kioskMode ? "w-full h-full rounded-none" : "w-full max-w-md"), onClick: (e) => e.stopPropagation(), children: [!kioskMode && (_jsx("div", { className: "absolute top-4 right-4 z-10", children: _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, className: "text-gray-400 hover:text-white hover:bg-gray-800", children: _jsx(X, { className: "w-4 h-4" }) }) })), _jsxs("div", { className: cn("p-6", kioskMode && "h-full flex flex-col"), children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-full mb-4", children: _jsx(UserCheck, { className: "w-8 h-8 text-amber-500" }) }), _jsx("h2", { className: cn("font-bold text-white mb-2", kioskMode ? "text-4xl" : "text-2xl"), children: kioskMode ? 'Self Check-In' : 'Check-In Scanner' }), _jsx("p", { className: cn("text-gray-400", kioskMode && "text-lg"), children: "Scan QR code from your RSVP email" })] }), _jsx(AnimatePresence, { mode: "wait", children: isScanning && hasPermission ? (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: cn("relative rounded-lg overflow-hidden bg-gray-800 mb-4", kioskMode ? "flex-1" : "aspect-square"), children: [isProcessing && (_jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center bg-black/70", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "w-12 h-12 animate-spin text-amber-500 mx-auto mb-2" }), _jsx("p", { className: "text-white text-xl", children: "Processing check-in..." })] }) })), _jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "w-full h-full object-cover" }), _jsxs("div", { className: "absolute inset-0 pointer-events-none", children: [_jsxs("div", { className: cn("absolute border-2 border-amber-500 rounded-lg", kioskMode
                                                    ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96"
                                                    : "inset-8"), children: [_jsx("div", { className: "absolute -top-px -left-px w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-lg" }), _jsx("div", { className: "absolute -top-px -right-px w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-lg" }), _jsx("div", { className: "absolute -bottom-px -left-px w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-lg" }), _jsx("div", { className: "absolute -bottom-px -right-px w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-lg" })] }), kioskMode && (_jsxs("div", { className: "absolute bottom-8 left-1/2 -translate-x-1/2 text-center", children: [_jsx("p", { className: "text-white text-xl mb-2", children: "Position QR code within frame" }), _jsx("p", { className: "text-gray-400", children: "Hold steady for automatic scanning" })] }))] })] }, "scanner")) : (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "bg-gray-800 rounded-lg p-8 text-center mb-4", children: [_jsx(Camera, { className: "w-12 h-12 text-gray-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-400 mb-2", children: hasPermission === false
                                            ? 'Camera permission denied'
                                            : 'Camera not available' }), _jsx("p", { className: "text-sm text-gray-500", children: "Enter your check-in code manually below" })] }, "no-camera")) }), _jsxs("div", { className: cn("space-y-4", kioskMode && "mt-auto"), children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("span", { className: "w-full border-t border-gray-800" }) }), _jsx("div", { className: "relative flex justify-center text-xs uppercase", children: _jsx("span", { className: "bg-gray-900 px-2 text-gray-500", children: "or enter code" }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Input, { placeholder: kioskMode ? "Enter your check-in code" : "Enter check-in code", value: manualCode, onChange: (e) => setManualCode(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleManualEntry(), className: cn("bg-gray-800 border-gray-700 text-white placeholder:text-gray-500", kioskMode && "text-xl py-6"), disabled: isProcessing }), _jsx(Button, { onClick: handleManualEntry, disabled: !manualCode.trim() || isProcessing, className: cn("w-full bg-amber-500 hover:bg-amber-600 text-white", kioskMode && "text-xl py-6"), children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx(UserCheck, { className: "w-4 h-4 mr-2" }), "Check In"] })) })] }), hasPermission && !kioskMode && (_jsx(Button, { variant: "outline", onClick: () => setIsScanning(!isScanning), className: "w-full border-gray-700 text-gray-300 hover:bg-gray-800", children: isScanning ? 'Enter Code Manually' : 'Scan QR Code' }))] }), kioskMode && recentCheckins.length > 0 && (_jsxs("div", { className: "mt-8 pt-8 border-t border-gray-800", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Recent Check-ins" }), _jsx("div", { className: "space-y-2", children: recentCheckins.slice(0, 5).map((checkin, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, className: "flex items-center justify-between text-sm", children: [_jsxs("span", { className: "text-gray-400", children: [checkin.name, checkin.team && (_jsxs("span", { className: "text-amber-500 ml-2", children: ["\u2022 ", checkin.team] }))] }), _jsx("span", { className: "text-gray-500", children: checkin.time.toLocaleTimeString() })] }, index))) })] }))] })] }) }));
}
