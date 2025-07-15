interface ActivityItem {
    type: string;
    createdAt: string;
    description: string;
}
interface ActivityMonitorProps {
    recentActivity: ActivityItem[];
    tournamentId: string;
}
export declare function ActivityMonitor({ recentActivity, tournamentId }: ActivityMonitorProps): import("react/jsx-runtime").JSX.Element;
export {};
