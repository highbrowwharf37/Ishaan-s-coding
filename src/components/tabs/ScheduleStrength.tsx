import { useState, useMemo } from 'react';
import type { Team } from '../../types';
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
}

export default function ScheduleStrength({ teams, conferences, status, error }: Props) {
  const [confFilter, setConfFilter] = useState('');

  const sorted = useMemo(() => {
    const filtered = confFilter ? teams.filter(t => t.conf === confFilter) : teams;
    return computeSOL(filtered).sort((a, b) => b.oppO - a.oppO);
  }, [teams, confFilter]);

  const bounds = useMemo(() => ({
    maxO: Math.max(...sorted.map(t => t.oppO)),
    minO: Math.min(...sorted.map(t => t.oppO)),
    maxSOL: Math.max(...sorted.map(t => t.solScore)),
    minSOL: Math.min(...sorted.map(t => t.solScore)),
  }), [sorted]);

  if (status === 'loading') return <Loading />;
  if (status === 'error' && error) return <ErrorBox message={error} />;

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Strength of Schedule</h1>
          <p>How difficult each team's slate has been vs national average</p>
        </div>
      </div>
      <div className="filters">
        <label>Conference</label>
        <select value={confFilter} onChange={e => setConfFilter(e.target.value)}>
          <option value="">All Conferences</option>
          {conferences.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="sorted">SOS Rk</th>
              <th>Team</th>
              <th>Conf</th>
              <th className="num has-tip" data-tip="Higher = tougher schedule">Opp Avg OE</th>
              <th className="num has-tip" data-tip="Lower = tougher schedule">Opp Avg DE</th>
              <th className="num has-tip" data-tip="Strength of losses — quality of opposition when this team lost">SOL Score</th>
              <th className="num">Adj OE</th>
              <th className="num">Adj DE</th>
              <th className="num">Record</th>
              <th className="num">WAB</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => (
              <tr key={t.name}>
                <td className={`rank-cell${i < 5 ? ' top5' : ''}`}>{i + 1}</td>
                <td className="team-cell">{t.name}</td>
                <td><span className="pill pill-blue">{t.conf}</span></td>
                <td className="num">
                  <BarCell label={<strong>{t.oppO.toFixed(1)}</strong>} percent={pct(t.oppO, bounds.minO, bounds.maxO)} color="blue" />
                </td>
                <td className="num">{t.oppD.toFixed(1)}</td>
                <td className="num">
                  <BarCell label={<SOLBadge team={t} />} percent={pct(t.solScore, bounds.minSOL, bounds.maxSOL)} color="purple" />
                </td>
                <td className="num">{t.adjOE.toFixed(1)}</td>
                <td className="num">{t.adjDE.toFixed(1)}</td>
                <td className="num">{t.record}</td>
                <td className="num">
                  <span className={`pill ${t.wab >= 0 ? 'pill-green' : 'pill-red'}`}>
                    {fmtSign(t.wab)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="data-note">Data: barttorvik.com · SOL Score = quality of opponents faced in losses · Higher = tougher losses</p>
    </div>
  );
}
