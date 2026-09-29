import React, { useState } from 'react';
import Tabs from '../common/Tabs';
import PracticeSession from './PracticeSession';
import InterviewPlanner from './InterviewPlanner';

const TABS = [
  { id: 'practice', label: 'Practice questions' },
  { id: 'planner', label: 'Interview planner' },
];

/**
 * @param {{ tracker: ReturnType<typeof import('../../hooks/useTracker').default>, onFindJobs: () => void }} props
 */
export default function InterviewPrep({ tracker, onFindJobs }) {
  const [tab, setTab] = useState('practice');
  return (
    <div className="prep-view">
      <h2>Interview Prep</h2>
      <p className="section-description">Practice common questions out loud, then plan the days before each interview.</p>
      <Tabs tabs={TABS} active={tab} onChange={setTab} label="Interview prep sections" />
      {tab === 'practice' ? <PracticeSession /> : <InterviewPlanner tracker={tracker} onFindJobs={onFindJobs} />}
    </div>
  );
}
