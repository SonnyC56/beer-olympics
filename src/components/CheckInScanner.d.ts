interface CheckInScannerProps {
    onScanSuccess: (data: string) => void;
    onClose: () => void;
    kioskMode?: boolean;
}
export declare function CheckInScanner({ onScanSuccess, onClose, kioskMode }: CheckInScannerProps): import("react/jsx-runtime").JSX.Element;
export {};
