import React from 'react';
import Tabs from '../common/Tabs';
import { PREP_TABS } from '../../data/tabs';
import PracticeSession from './PracticeSession';
import InterviewPlanner from './InterviewPlanner';

/**
 * @param {{
 *   tracker: ReturnType<typeof import('../../hooks/useTracker').default>,
 *   onFindJobs: () => void,
 *   tab: string,
 *   onTabChange: (tab: string) => void,
 * }} props
 */
export default function InterviewPrep({ tracker, onFindJobs, tab, onTabChange }) {
  return (
    <div className="prep-view">
      <h2>Interview Prep</h2>
      <p className="section-description">Practice common questions out loud, then plan the days before each interview.</p>
      <Tabs tabs={PREP_TABS} active={tab} onChange={onTabChange} label="Interview prep sections" />
      {tab === 'practice' ? <PracticeSession /> : <InterviewPlanner tracker={tracker} onFindJobs={onFindJobs} />}
    </div>
  );
}
