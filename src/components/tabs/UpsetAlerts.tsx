import { useMemo } from 'react';
import type { TeamWithSOL } from '../../types';
import SOLBadge from '../ui/SOLBadge';
import { Loading, ErrorBox, Empty } from '../ui/Loading';

interface Props {
  teamsWithSOL: TeamWithSOL[];
  status: string;
  error: string | null;
}

export default function UpsetAlerts({ teamsWithSOL, status, error }: Props) {
  const upsets = useMemo(() => {
    const sorted = [...teamsWithSOL].sort((a, b) => b.barthag - a.barthag);
    const result: { underdog: TeamWithSOL; favorite: TeamWithSOL; upsetProb: number; adjUpsetProb: number; solBoost: number }[] = [];
    for (let i = 20; i < sorted.length; i++) {
      const underdog = sorted[i];
      const randOpp = sorted[Math.floor(i * 0.3)];
      if (!randOpp) continue;
      const pU = underdog.barthag;
      const pF = randOpp.barthag;
      const upsetProb = (pU - pU * pF) / (pU + pF - 2 * pU * pF);
      const solBoost = ((underdog.solScore - 50) / 100) * 0.03;
      const adjUpsetProb = Math.min(0.55, upsetProb + solBoost);
      if (adjUpsetProb > 0.30 && adjUpsetProb < 0.55) {
        result.push({ underdog, favorite: randOpp, upsetProb, adjUpsetProb, solBoost });
      }
    }
    return result.sort((a, b) => b.adjUpsetProb - a.adjUpsetProb).slice(0, 25);
  }, [teamsWithSOL]);

  if (status === 'loading') return <Loading />;
  if (status === 'error' && error) return <ErrorBox message={error} />;
  if (!upsets.length) return <Empty message="No significant upset opportunities found." />;

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Upset Alerts</h1>
          <p>Teams with elevated win probability — weighted by strength of losses</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Underdog</th>
              <th>vs Favorite</th>
              <th className="num has-tip" data-tip="Base upset probability">Base Prob</th>
              <th className="num has-tip" data-tip="Adjusted for underdog's strength of losses">SOL-adj Prob</th>
              <th className="num has-tip" data-tip="Underdog strength of losses">Underdog SOL</th>
              <th className="num">Underdog Barthag</th>
              <th className="num">Favorite Barthag</th>
              <th className="num">Underdog Record</th>
              <th className="num">Alert Level</th>
            </tr>
          </thead>
          <tbody>
            {upsets.map(({ underdog, favorite, upsetProb, adjUpsetProb, solBoost }) => {
              const level = adjUpsetProb > 0.42 ? 'HIGH' : adjUpsetProb > 0.36 ? 'MEDIUM' : 'LOW';
              const levelClass = level === 'HIGH' ? 'upset-level-high' : level === 'MEDIUM' ? 'upset-level-med' : '';
              const boosted = solBoost > 0.005;
              return (
                <tr key={`${underdog.name}-${favorite.name}`}>
                  <td className="team-cell">{underdog.name}<span className="conf-tag">{underdog.conf}</span></td>
                  <td className="team-cell">{favorite.name}<span className="conf-tag">{favorite.conf}</span></td>
                  <td className="num">{(upsetProb * 100).toFixed(1)}%</td>
                  <td className="num">
                    <strong>{(adjUpsetProb * 100).toFixed(1)}%</strong>
                    {boosted && <span style={{ fontSize: 10, color: 'var(--green)' }}> +{(solBoost * 100).toFixed(1)}%</span>}
                  </td>
                  <td className="num"><SOLBadge team={underdog} /></td>
                  <td className="num">{(underdog.barthag * 100).toFixed(1)}%</td>
                  <td className="num">{(favorite.barthag * 100).toFixed(1)}%</td>
                  <td className="num">{underdog.record}</td>
                  <td className="num"><span className={levelClass}>{level}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="data-note">Upset potential = lower-ranked team barthag vs higher-ranked opponent · Boosted if underdog has elite SOL</p>
    </div>
  );
}
