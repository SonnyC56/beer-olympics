import type { RSVPData } from '@/services/rsvp';
interface RSVPFormProps {
    tournamentSlug: string;
    tournamentName: string;
    eventDate: string;
    onSuccess?: (rsvp: RSVPData) => void;
    onCancel?: () => void;
}
export declare function RSVPForm({ tournamentSlug, tournamentName, eventDate, onSuccess, onCancel }: RSVPFormProps): import("react/jsx-runtime").JSX.Element;
export {};
