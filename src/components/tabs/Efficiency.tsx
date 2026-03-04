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

export default function Efficiency({ teams, conferences, status, error }: Props) {
  const [confFilter, setConfFilter] = useState('');

  const sorted = useMemo(() => {
    const filtered = confFilter ? teams.filter(t => t.conf === confFilter) : teams;
    return computeSOL(filtered).sort((a, b) => b.netEM - a.netEM);
  }, [teams, confFilter]);

  const stats = useMemo(() => {
    if (!sorted.length) return null;
    const avgOE = (sorted.reduce((s, t) => s + t.adjOE, 0) / sorted.length).toFixed(1);
    const avgDE = (sorted.reduce((s, t) => s + t.adjDE, 0) / sorted.length).toFixed(1);
    const best = sorted[0];
    const fast = [...sorted].sort((a, b) => b.adjT - a.adjT)[0];
    const bestSOL = [...sorted].sort((a, b) => b.solScore - a.solScore)[0];
    return { avgOE, avgDE, best, fast, bestSOL };
  }, [sorted]);

  const bounds = useMemo(() => ({
    maxOE: Math.max(...sorted.map(t => t.adjOE)),
    minOE: Math.min(...sorted.map(t => t.adjOE)),
    maxDE: Math.max(...sorted.map(t => t.adjDE)),
    minDE: Math.min(...sorted.map(t => t.adjDE)),
  }), [sorted]);

  if (status === 'loading') return <Loading />;
  if (status === 'error' && error) return <ErrorBox message={error} />;

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Offensive &amp; Defensive Efficiency</h1>
          <p>Points per 100 possessions, adjusted for opponent strength</p>
        </div>
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-label">Avg Off Efficiency</div>
            <div className="stat-card-value" style={{ color: 'var(--blue)' }}>{stats.avgOE}</div>
            <div className="stat-card-sub">pts per 100 possessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Avg Def Efficiency</div>
            <div className="stat-card-value" style={{ color: 'var(--accent)' }}>{stats.avgDE}</div>
            <div className="stat-card-sub">pts allowed per 100</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Best Net Efficiency</div>
            <div className="stat-card-value" style={{ color: 'var(--green)' }}>+{stats.best?.netEM.toFixed(1)}</div>
            <div className="stat-card-sub">{stats.best?.name}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Fastest Tempo</div>
            <div className="stat-card-value">{stats.fast?.adjT.toFixed(1)}</div>
            <div className="stat-card-sub">{stats.fast?.name}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Best Loss Quality</div>
            <div className="stat-card-value" style={{ color: 'var(--purple)', fontSize: 18 }}>{stats.bestSOL?.name}</div>
            <div className="stat-card-sub">SOL {stats.bestSOL?.solScore.toFixed(0)} — {stats.bestSOL?.solLabel}</div>
          </div>
        </div>
      )}

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
              <th className="sorted">Rk</th>
              <th>Team</th>
              <th className="num">Adj OE</th>
              <th className="num">Adj DE</th>
              <th className="num">Net EM</th>
              <th className="num">Tempo</th>
              <th className="num">Opp OE</th>
              <th className="num">Opp DE</th>
              <th className="num has-tip" data-tip="Strength of Losses — quality of opponents when this team lost">SOL</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => (
              <tr key={t.name}>
                <td className={`rank-cell${i < 5 ? ' top5' : ''}`}>{i + 1}</td>
                <td className="team-cell">{t.name}<span className="conf-tag">{t.conf}</span></td>
                <td className="num">
                  <BarCell label={t.adjOE.toFixed(1)} percent={pct(t.adjOE, bounds.minOE, bounds.maxOE)} color="blue" />
                </td>
                <td className="num">
                  <BarCell label={t.adjDE.toFixed(1)} percent={pct(bounds.maxDE - t.adjDE, 0, bounds.maxDE - bounds.minDE)} color="red" />
                </td>
                <td className="num">
                  <strong style={{ color: t.netEM > 0 ? 'var(--green)' : 'var(--accent)' }}>
                    {fmtSign(t.netEM)}
                  </strong>
                </td>
                <td className="num">{t.adjT.toFixed(1)}</td>
                <td className="num">{t.oppO.toFixed(1)}</td>
                <td className="num">{t.oppD.toFixed(1)}</td>
                <td className="num"><SOLBadge team={t} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="data-note">Data: barttorvik.com · SOL = strength of losses (avg opponent Barthag when this team lost)</p>
    </div>
  );
}
