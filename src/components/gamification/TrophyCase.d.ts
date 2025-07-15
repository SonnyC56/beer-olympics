import React from 'react';
import type { Achievement } from '../../types';
interface TrophyCaseProps {
    achievements: Achievement[];
    allAchievements?: Achievement[];
    showLocked?: boolean;
    groupByCategory?: boolean;
    className?: string;
}
declare const TrophyCase: React.FC<TrophyCaseProps>;
export default TrophyCase;
