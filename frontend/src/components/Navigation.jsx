export default function Navigation({ activeTab, onTabChange }) {
  const tabs = ['alltime', 'byseason', 'football'];
  const labels = {
    alltime: 'All Time Leaders 🏀',
    byseason: 'By Season 🏀',
    football: 'All Time Leaders 🏈',
  };

  return (
    <nav>
      <div className="nav-inner">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {labels[tab]}
          </button>
        ))}
      </div>
    </nav>
  );
}
