import { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import AllTimeLeaders from './components/AllTimeLeaders';
import BySeason from './components/BySeason';
import AllTimeFootball from './components/AllTimeFootball';
import { loadAllTimeData, loadFootballAllTimeData, loadManifest, loadSeasonData } from './utils/dataLoader';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('alltime');
  const [allTimeData, setAllTimeData] = useState([]);
  const [footballData, setFootballData] = useState([]);
  const [seasonData, setSeasonData] = useState({});
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all-time data
        const fullData = await loadAllTimeData();
        setAllTimeData(fullData);

        // Load football data
        const footballAllTimeData = await loadFootballAllTimeData();
        setFootballData(footballAllTimeData);

        // Load available seasons
        const seasons = await loadManifest();
        setAvailableSeasons(seasons);

        // Load seasonal data
        const seasonalData = {};
        for (const season of seasons) {
          try {
            const data = await loadSeasonData(season);
            if (data.length > 0) {
              seasonalData[season] = data;
            }
          } catch (err) {
            console.error(`Failed to load season ${season}:`, err);
          }
        }
        setSeasonData(seasonalData);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main key={activeTab}>
        {activeTab === 'alltime' && (
          <AllTimeLeaders key="alltime" data={allTimeData} loading={loading} error={error} />
        )}
        {activeTab === 'byseason' && (
          <BySeason key="byseason" seasons={availableSeasons} seasonData={seasonData} loading={loading} error={error} />
        )}
        {activeTab === 'football' && (
          <AllTimeFootball key="football" data={footballData} loading={loading} error={error} />
        )}
      </main>
    </>
  );
}

export default App;
