import type { Achievement } from '../../types';
interface BadgeProps {
    achievement: Achievement;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showTooltip?: boolean;
    unlocked?: boolean;
    onClick?: () => void;
    className?: string;
}
declare const Badge: React.FC<BadgeProps>;
export default Badge;
