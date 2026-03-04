import { useState, useMemo } from 'react';
import type { Team, TeamWithSOL } from '../../types';
import { computeSOL } from '../../utils/computeSOL';
import { pct, fmtSign } from '../../utils/formatting';
import SOLBadge from '../ui/SOLBadge';
import BarCell from '../ui/BarCell';
import { Loading, ErrorBox } from '../ui/Loading';

interface Props {
  teams: Team[];
  conferences: string[];
  status: string;
  error: string | null;
  updatedLabel: string;
}

export default function PowerRankings({ teams, conferences, status, error, updatedLabel }: Props) {
  const [confFilter, setConfFilter] = useState('');

  const sorted = useMemo((): TeamWithSOL[] => {
    const filtered = confFilter ? teams.filter(t => t.conf === confFilter) : teams;
    return computeSOL(filtered).sort((a, b) => b.barthag - a.barthag);
  }, [teams, confFilter]);

  const minEM = useMemo(() => Math.min(...sorted.map(t => t.netEM)), [sorted]);
  const maxEM = useMemo(() => Math.max(...sorted.map(t => t.netEM)), [sorted]);

  if (status === 'loading') return <Loading />;
  if (status === 'error' && error) return <ErrorBox message={error} />;

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Team Power Rankings</h1>
          <p>Barthag win probability + adjusted efficiency — live from Barttorvik</p>
        </div>
      </div>
      <div className="sol-infobox">
        <strong>🏆 Strength of Losses (SOL)</strong> is now factored into all rankings. SOL measures the average Barthag of opponents a team lost to — teams that only lose to elite squads are rated higher than those dropping games to weak competition.{' '}
        <strong>Elite</strong> = avg loss opponent Barthag ≥ 80% · <strong>Good</strong> ≥ 65% · <strong>Average</strong> ≥ 50% · <strong>Poor</strong> &lt; 50%
      </div>
      <div className="filters">
        <label>Conference</label>
        <select value={confFilter} onChange={e => setConfFilter(e.target.value)}>
          <option value="">All Conferences</option>
          {conferences.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="filter-spacer" />
        <span className="last-updated">As of {updatedLabel.replace('Live · ', '')}</span>
      </div>

      {sorted.length === 0 ? (
        <div className="loading-bar">No data.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="sorted">Rk</th>
                <th>Team</th>
                <th>Conf</th>
                <th className="num">Record</th>
                <th className="num has-tip" data-tip="Win prob vs avg D1">Barthag</th>
                <th className="num has-tip" data-tip="Adj Off − Adj Def">Net EM</th>
                <th className="num">Adj OE</th>
                <th className="num">Adj DE</th>
                <th className="num">Tempo</th>
                <th className="num has-tip" data-tip="Wins above bubble">WAB</th>
                <th className="num has-tip" data-tip="Quality of opponents in losses. Elite/Good/Avg/Poor + 0-100 score">SOL</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => (
                <tr key={t.name}>
                  <td className={`rank-cell${i < 5 ? ' top5' : ''}`}>{i + 1}</td>
                  <td className="team-cell">{t.name}<span className="conf-tag">{t.conf}</span></td>
                  <td><span className="pill pill-blue">{t.conf}</span></td>
                  <td className="num">{t.record}</td>
                  <td className="num"><strong>{(t.barthag * 100).toFixed(1)}%</strong></td>
                  <td className="num">
                    <BarCell
                      label={fmtSign(t.netEM)}
                      percent={pct(t.netEM, minEM, maxEM)}
                      color="green"
                    />
                  </td>
                  <td className="num">{t.adjOE.toFixed(1)}</td>
                  <td className="num">{t.adjDE.toFixed(1)}</td>
                  <td className="num">{t.adjT.toFixed(1)}</td>
                  <td className="num">
                    <span className={`pill ${t.wab >= 0 ? 'pill-green' : 'pill-red'}`}>
                      {fmtSign(t.wab)}
                    </span>
                  </td>
                  <td className="num"><SOLBadge team={t} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="data-note">Data: barttorvik.com · Barthag = win probability vs avg D1 · WAB = wins above bubble · SOL = avg opponent Barthag on losses</p>
    </div>
  );
}
