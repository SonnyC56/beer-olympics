import React from 'react';
import type { PlayerXP, XPGain } from '../../services/xp-system';
interface XPDisplayProps {
    playerXP: PlayerXP;
    showAnimations?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
declare const XPDisplay: React.FC<XPDisplayProps>;
interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    oldLevel: number;
    newLevel: number;
    newLevelName: string;
    rewards: any[];
}
export declare const LevelUpModal: React.FC<LevelUpModalProps>;
interface XPGainToastProps {
    gain: XPGain;
    isVisible: boolean;
    onHide: () => void;
}
export declare const XPGainToast: React.FC<XPGainToastProps>;
export default XPDisplay;
