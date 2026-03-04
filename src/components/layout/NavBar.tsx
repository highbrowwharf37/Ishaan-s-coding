import type { TabId } from '../../types';

const TABS: { id: TabId; label: string }[] = [
  { id: 'power',       label: 'Power Rankings' },
  { id: 'efficiency',  label: 'Efficiency' },
  { id: 'sos',         label: 'Schedule Strength' },
  { id: 'predictor',   label: 'Game Predictor' },
  { id: 'bubble',      label: 'Bubble Tracker' },
  { id: 'momentum',    label: 'Momentum' },
  { id: 'h2h',         label: 'Head-to-Head' },
  { id: 'upset',       label: 'Upset Alerts' },
  { id: 'confstrength',label: 'Conf Strength' },
  { id: 'cinderella',  label: '🥿 Cinderella Watch' },
  { id: 'draftboard',  label: '🏀 NBA Draft Board' },
];

interface NavBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function NavBar({ activeTab, onTabChange }: NavBarProps) {
  return (
    <nav>
      <div className="nav-inner">
        {TABS.map(t => (
          <div
            key={t.id}
            className={`nav-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </div>
        ))}
      </div>
    </nav>
  );
}
