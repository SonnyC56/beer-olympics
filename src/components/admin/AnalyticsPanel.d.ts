interface AnalyticsPanelProps {
    analytics: any;
    selectedTimeframe: 'all' | 'today' | 'week' | 'month';
    onTimeframeChange: (timeframe: any) => void;
}
export declare function AnalyticsPanel({ analytics, selectedTimeframe, onTimeframeChange }: AnalyticsPanelProps): import("react/jsx-runtime").JSX.Element;
export {};
