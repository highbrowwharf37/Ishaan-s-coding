import { useState } from 'react';
import type { TeamWithSOL } from '../../types';
import SOLBadge from '../ui/SOLBadge';
import { Loading } from '../ui/Loading';

interface Props {
  teamsWithSOL: TeamWithSOL[];
  status: string;
}

export default function HeadToHead({ teamsWithSOL, status }: Props) {
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [comparison, setComparison] = useState<{ a: TeamWithSOL; b: TeamWithSOL } | null>(null);
  const [err, setErr] = useState('');

  const sorted = [...teamsWithSOL].sort((a, b) => a.name.localeCompare(b.name));

  function compare() {
    if (!teamAName || !teamBName || teamAName === teamBName) {
      setErr('Please select two different teams.');
      setComparison(null);
      return;
    }
    const a = teamsWithSOL.find(t => t.name === teamAName);
    const b = teamsWithSOL.find(t => t.name === teamBName);
    if (!a || !b) return;
    setErr('');
    setComparison({ a, b });
  }

  if (status === 'loading') return <Loading />;

  const a = comparison?.a;
  const b = comparison?.b;

  let adjWinA = 0;
  let isClose = false;
  if (a && b) {
    const pA2 = a.barthag, pB2 = b.barthag;
    const winA = (pA2 - pA2 * pB2) / (pA2 + pB2 - 2 * pA2 * pB2);
    const spread = Math.abs(winA - (1 - winA));
    isClose = spread < 0.12;
    const solAdj = isClose ? ((a.solScore - b.solScore) / 100) * 0.06 : 0;
    adjWinA = Math.max(0.02, Math.min(0.98, winA + solAdj));
  }

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Head-to-Head Comparison</h1>
          <p>Side-by-side breakdown including strength of losses</p>
        </div>
      </div>

      <div className="two-col">
        <div className="picker-card">
          <h3>Team A</h3>
          <select value={teamAName} onChange={e => setTeamAName(e.target.value)}>
            <option value="">Select team...</option>
            {sorted.map(t => <option key={t.name} value={t.name}>{t.name} ({t.conf})</option>)}
          </select>
          <button className="action-btn" onClick={compare}>Compare →</button>
        </div>
        <div className="vs-mid">vs</div>
        <div className="picker-card">
          <h3>Team B</h3>
          <select value={teamBName} onChange={e => setTeamBName(e.target.value)}>
            <option value="">Select team...</option>
            {sorted.map(t => <option key={t.name} value={t.name}>{t.name} ({t.conf})</option>)}
          </select>
        </div>
      </div>

      {err && <div className="error-box">{err}</div>}

      {comparison && a && b && (
        <div className="result-card">
          <div className="h2h-header">
            <span className="h2h-team-name h2h-team-a">{a.name}</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                WIN PROBABILITY {isClose ? '(SOL-adjusted)' : ''}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                <span style={{ color: 'var(--blue)' }}>{(adjWinA * 100).toFixed(0)}%</span>
                {' – '}
                <span style={{ color: 'var(--accent)' }}>{((1 - adjWinA) * 100).toFixed(0)}%</span>
              </div>
              {isClose && (
                <div style={{ fontSize: 11, color: 'var(--purple)', marginTop: 3 }}>
                  SOL tiebreaker applied (spread &lt;12%)
                </div>
              )}
            </div>
            <span className="h2h-team-name h2h-team-b" style={{ textAlign: 'right' }}>{b.name}</span>
          </div>
          <div className="prob-bar" style={{ marginBottom: 20 }}>
            <div className="prob-bar-fill" style={{ width: `${(adjWinA * 100).toFixed(0)}%` }} />
          </div>

          <div className="h2h-bars">
            {[
              { label: 'Adj Offense',        av: a.adjOE,       bv: b.adjOE,       higherBetter: true,  isSOL: false },
              { label: 'Adj Defense',        av: a.adjDE,       bv: b.adjDE,       higherBetter: false, isSOL: false },
              { label: 'Net Efficiency',     av: a.netEM,       bv: b.netEM,       higherBetter: true,  isSOL: false },
              { label: 'Barthag',            av: a.barthag*100, bv: b.barthag*100, higherBetter: true,  isSOL: false },
              { label: 'Tempo',              av: a.adjT,        bv: b.adjT,        higherBetter: null,  isSOL: false },
              { label: 'WAB',                av: a.wab,         bv: b.wab,         higherBetter: true,  isSOL: false },
              { label: 'SOS',                av: a.sos,         bv: b.sos,         higherBetter: true,  isSOL: false },
              { label: 'Strength of Losses', av: a.solScore,    bv: b.solScore,    higherBetter: true,  isSOL: true  },
            ].map(m => {
              const maxV = Math.max(Math.abs(m.av), Math.abs(m.bv), 1);
              const pA2 = Math.min(100, (Math.abs(m.av) / maxV) * 100);
              const pB2 = Math.min(100, (Math.abs(m.bv) / maxV) * 100);
              const aWins = m.higherBetter === null ? false : m.higherBetter ? m.av > m.bv : m.av < m.bv;
              const bWins = m.higherBetter === null ? false : m.higherBetter ? m.bv > m.av : m.bv < m.av;
              const rowBg = m.isSOL ? { background: 'var(--purple-light)', borderRadius: 4, marginBottom: 4 } : {};
              return (
                <div key={m.label} className="h2h-row" style={rowBg}>
                  <span className="h2h-val-left" style={{ color: aWins ? 'var(--blue)' : 'var(--text-primary)' }}>
                    {m.av.toFixed(1)}{m.isSOL ? '/100' : ''}
                  </span>
                  <div className="h2h-bar-left">
                    <div className={`hbar ${m.isSOL ? 'hbar-purple' : 'hbar-blue'}`} style={{ width: pA2, maxWidth: 100 }} />
                  </div>
                  <span className="h2h-label" style={{ color: m.isSOL ? 'var(--purple)' : 'inherit' }}>
                    {m.label}{m.isSOL ? ' 🏆' : ''}
                  </span>
                  <div className="h2h-bar-right">
                    <div className={`hbar ${m.isSOL ? 'hbar-purple' : 'hbar-red'}`} style={{ width: pB2, maxWidth: 100 }} />
                  </div>
                  <span className="h2h-val-right" style={{ color: bWins ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {m.bv.toFixed(1)}{m.isSOL ? '/100' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
            <SOLBadge team={a} />
            <SOLBadge team={b} />
          </div>
        </div>
      )}
    </div>
  );
}
