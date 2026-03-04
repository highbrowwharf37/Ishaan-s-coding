import { useState, useMemo } from 'react';
import type { Team } from '../../types';
import { computeSOL } from '../../utils/computeSOL';
import SOLBadge from '../ui/SOLBadge';
import { Loading, ErrorBox } from '../ui/Loading';

interface Props {
  teams: Team[];
  conferences: string[];
  status: string;
  error: string | null;
}

export default function Momentum({ teams, conferences, status, error }: Props) {
  const [confFilter, setConfFilter] = useState('');
  const [dirFilter, setDirFilter] = useState('');

  const sorted = useMemo(() => {
    const filtered = confFilter ? teams.filter(t => t.conf === confFilter) : teams;
    let result = computeSOL(filtered).map(t => {
      const totalGames = t.w + t.l;
      const actualWinPct = totalGames > 0 ? t.w / totalGames : 0;
      const momentum = (actualWinPct - t.barthag) * 100;
      const solMomAdj = ((t.solScore - 50) / 100) * 3;
      const adjMomentum = momentum + solMomAdj;
      return { ...t, momentum, adjMomentum };
    }).sort((a, b) => b.adjMomentum - a.adjMomentum);

    if (dirFilter === 'up')   result = result.filter(t => t.adjMomentum > 2);
    if (dirFilter === 'down') result = result.filter(t => t.adjMomentum < -2);
    return result;
  }, [teams, confFilter, dirFilter]);

  if (status === 'loading') return <Loading />;
  if (status === 'error' && error) return <ErrorBox message={error} />;

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Team Momentum</h1>
          <p>Teams trending up or down — adjusted for strength of losses</p>
        </div>
      </div>
      <div className="filters">
        <label>Conference</label>
        <select value={confFilter} onChange={e => setConfFilter(e.target.value)}>
          <option value="">All Conferences</option>
          {conferences.map(c => <option key={c}>{c}</option>)}
        </select>
        <label>Show</label>
        <select value={dirFilter} onChange={e => setDirFilter(e.target.value)}>
          <option value="">All Teams</option>
          <option value="up">🔥 Trending Up</option>
          <option value="down">📉 Trending Down</option>
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rk</th>
              <th>Team</th>
              <th>Conf</th>
              <th className="num has-tip" data-tip="SOL-adjusted momentum: actual win% vs expected + loss quality">Momentum (adj)</th>
              <th className="num">Actual W%</th>
              <th className="num">Expected W%</th>
              <th className="num has-tip" data-tip="Strength of Losses — adjusts momentum for loss quality">SOL</th>
              <th className="num">Record</th>
              <th className="num">Barthag</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => {
              const arrow = t.adjMomentum > 3 ? '▲' : t.adjMomentum < -3 ? '▼' : '—';
              const arrowClass = t.adjMomentum > 3 ? 'momentum-arrow-up' : t.adjMomentum < -3 ? 'momentum-arrow-down' : 'momentum-arrow-flat';
              const totalG = t.w + t.l;
              const actualWP = totalG > 0 ? ((t.w / totalG) * 100).toFixed(1) : '0.0';
              const expWP = (t.barthag * 100).toFixed(1);
              return (
                <tr key={t.name}>
                  <td className={`rank-cell${i < 5 ? ' top5' : ''}`}>{i + 1}</td>
                  <td className="team-cell">{t.name}</td>
                  <td><span className="pill pill-blue">{t.conf}</span></td>
                  <td className="num">
                    <span className={arrowClass}>
                      {arrow} {t.adjMomentum >= 0 ? '+' : ''}{t.adjMomentum.toFixed(1)}%
                    </span>
                  </td>
                  <td className="num">{actualWP}%</td>
                  <td className="num">{expWP}%</td>
                  <td className="num"><SOLBadge team={t} /></td>
                  <td className="num">{t.record}</td>
                  <td className="num">{(t.barthag * 100).toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
