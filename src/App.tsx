import { useState } from 'react';
import type { TabId } from './types';
import { useTeamData } from './hooks/useTeamData';
import Header from './components/layout/Header';
import NavBar from './components/layout/NavBar';
import PowerRankings from './components/tabs/PowerRankings';
import Efficiency from './components/tabs/Efficiency';
import ScheduleStrength from './components/tabs/ScheduleStrength';
import GamePredictor from './components/tabs/GamePredictor';
import BubbleTracker from './components/tabs/BubbleTracker';
import Momentum from './components/tabs/Momentum';
import HeadToHead from './components/tabs/HeadToHead';
import UpsetAlerts from './components/tabs/UpsetAlerts';
import ConferenceStrength from './components/tabs/ConferenceStrength';
import CinderellaWatch from './components/tabs/CinderellaWatch';
import DraftBoard from './components/tabs/DraftBoard';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('power');
  const { teams, teamsWithSOL, conferences, status, error, updatedLabel } = useTeamData();

  const tabProps = { teams, conferences, status, error };

  return (
    <>
      <Header updatedLabel={updatedLabel} />
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
      <main>
        {activeTab === 'power'        && <PowerRankings {...tabProps} updatedLabel={updatedLabel} />}
        {activeTab === 'efficiency'   && <Efficiency {...tabProps} />}
        {activeTab === 'sos'          && <ScheduleStrength {...tabProps} />}
        {activeTab === 'predictor'    && <GamePredictor teamsWithSOL={teamsWithSOL} status={status} />}
        {activeTab === 'bubble'       && <BubbleTracker teamsWithSOL={teamsWithSOL} status={status} error={error} />}
        {activeTab === 'momentum'     && <Momentum {...tabProps} />}
        {activeTab === 'h2h'          && <HeadToHead teamsWithSOL={teamsWithSOL} status={status} />}
        {activeTab === 'upset'        && <UpsetAlerts teamsWithSOL={teamsWithSOL} status={status} error={error} />}
        {activeTab === 'confstrength' && <ConferenceStrength teamsWithSOL={teamsWithSOL} status={status} error={error} />}
        {activeTab === 'cinderella'   && <CinderellaWatch teamsWithSOL={teamsWithSOL} status={status} error={error} />}
        {activeTab === 'draftboard'   && <DraftBoard />}
      </main>
    </>
  );
}
