import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
// import { QrReader } from 'react-qr-reader'; // Missing module - commented out
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { authEnhanced } from '@/services/auth-enhanced';
import { toast } from 'sonner';
export function QRScanner({ onScanSuccess, onClose }) {
    const [isScanning, setIsScanning] = useState(true);
    const [manualCode, setManualCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
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
        if (!manualCode.trim() || isProcessing)
            return;
        setIsProcessing(true);
        try {
            const result = await authEnhanced.useInvite(manualCode.trim(), 'current-user-id'); // TODO: Get actual user ID
            if (result.success && result.teamId && result.tournamentId) {
                toast.success('Successfully joined team!');
                onScanSuccess({
                    teamId: result.teamId,
                    tournamentId: result.tournamentId
                });
            }
            else {
                throw new Error(result.error || 'Failed to join team');
            }
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : 'Invalid invite code');
            setIsProcessing(false);
        }
    };
    if (hasPermission === null) {
        return (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-amber-500" }) }));
    }
    return (_jsx(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: onClose, children: _jsxs(Card, { className: "relative w-full max-w-md bg-gray-900 border-gray-800", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "absolute top-4 right-4 z-10", children: _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, className: "text-gray-400 hover:text-white hover:bg-gray-800", children: _jsx(X, { className: "w-4 h-4" }) }) }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-full mb-4", children: _jsx(QrCode, { className: "w-8 h-8 text-amber-500" }) }), _jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Join Team" }), _jsx("p", { className: "text-gray-400", children: "Scan QR code or enter invite code" })] }), _jsx(AnimatePresence, { mode: "wait", children: isScanning && hasPermission ? (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "relative aspect-square rounded-lg overflow-hidden bg-gray-800 mb-4", children: [isProcessing && (_jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center bg-black/70", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" }), _jsx("p", { className: "text-white", children: "Processing..." })] }) })), _jsxs("div", { className: "bg-gray-800 rounded-lg p-8 text-center", children: [_jsx(Camera, { className: "w-12 h-12 text-gray-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-400 mb-2", children: "QR Scanner temporarily unavailable" }), _jsx("p", { className: "text-sm text-gray-500", children: "Please enter invite code manually" })] }), _jsx("div", { className: "absolute inset-0 pointer-events-none", children: _jsxs("div", { className: "absolute inset-8 border-2 border-amber-500 rounded-lg", children: [_jsx("div", { className: "absolute -top-px -left-px w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-lg" }), _jsx("div", { className: "absolute -top-px -right-px w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-lg" }), _jsx("div", { className: "absolute -bottom-px -left-px w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-lg" }), _jsx("div", { className: "absolute -bottom-px -right-px w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-lg" })] }) })] }, "scanner")) : (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "bg-gray-800 rounded-lg p-8 text-center mb-4", children: [_jsx(Camera, { className: "w-12 h-12 text-gray-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-400 mb-2", children: hasPermission === false
                                            ? 'Camera permission denied'
                                            : 'Camera not available' }), _jsx("p", { className: "text-sm text-gray-500", children: "Enter invite code manually below" })] }, "no-camera")) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("span", { className: "w-full border-t border-gray-800" }) }), _jsx("div", { className: "relative flex justify-center text-xs uppercase", children: _jsx("span", { className: "bg-gray-900 px-2 text-gray-500", children: "or" }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Input, { placeholder: "Enter invite code", value: manualCode, onChange: (e) => setManualCode(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleManualEntry(), className: "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500", disabled: isProcessing }), _jsx(Button, { onClick: handleManualEntry, disabled: !manualCode.trim() || isProcessing, className: "w-full bg-amber-500 hover:bg-amber-600 text-white", children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Processing..."] })) : ('Join Team') })] }), hasPermission && (_jsx(Button, { variant: "outline", onClick: () => setIsScanning(!isScanning), className: "w-full border-gray-700 text-gray-300 hover:bg-gray-800", children: isScanning ? 'Enter Code Manually' : 'Scan QR Code' }))] })] })] }) }));
}
