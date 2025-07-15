interface QRScannerProps {
    onScanSuccess: (data: {
        teamId: string;
        tournamentId: string;
    }) => void;
    onClose: () => void;
}
export declare function QRScanner({ onScanSuccess, onClose }: QRScannerProps): import("react/jsx-runtime").JSX.Element;
export {};
