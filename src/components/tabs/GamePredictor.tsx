import { useState } from 'react';
import type { TeamWithSOL, PredictorResult } from '../../types';
import { runPrediction } from '../../utils/predictor';
import SOLBadge from '../ui/SOLBadge';
import { Loading } from '../ui/Loading';

interface Props {
  teamsWithSOL: TeamWithSOL[];
  status: string;
}

export default function GamePredictor({ teamsWithSOL, status }: Props) {
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [result, setResult] = useState<PredictorResult | null>(null);
  const [err, setErr] = useState('');

  const sorted = [...teamsWithSOL].sort((a, b) => a.name.localeCompare(b.name));

  function simulate() {
    if (!teamAName || !teamBName || teamAName === teamBName) {
      setErr('Please select two different teams.');
      setResult(null);
      return;
    }
    const a = teamsWithSOL.find(t => t.name === teamAName);
    const b = teamsWithSOL.find(t => t.name === teamBName);
    if (!a || !b) return;
    setErr('');
    setResult(runPrediction(a, b));
  }

  if (status === 'loading') return <Loading />;

  const aWins = result ? result.adjWinA > result.adjWinB : false;
  const a = result?.teamA;
  const b = result?.teamB;
  const avgPoss = a && b ? (a.adjT + b.adjT) / 2 : 0;

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Game Outcome Predictor</h1>
          <p>Win probability based on efficiency matchup, schedule strength, and strength of losses</p>
        </div>
      </div>

      <div className="two-col">
        <div className="picker-card">
          <h3>Team A</h3>
          <select value={teamAName} onChange={e => setTeamAName(e.target.value)}>
            <option value="">Select team...</option>
            {sorted.map(t => <option key={t.name} value={t.name}>{t.name} ({t.conf})</option>)}
          </select>
          <button className="action-btn" onClick={simulate}>Simulate Matchup →</button>
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

      {result && a && b && (
        <div className="result-card">
          <div className="result-teams-row">
            <div className="result-team">
              <div className="result-name">{a.name}</div>
              <div className={`result-pct ${aWins ? 'win' : 'lose'}`}>{result.pctA}%</div>
              <div className="result-label">{aWins ? 'FAVORED' : 'UNDERDOG'}</div>
              <div style={{ marginTop: 6 }}><SOLBadge team={a} /></div>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 18, fontFamily: 'var(--font-serif)' }}>vs</div>
            <div className="result-team">
              <div className="result-name">{b.name}</div>
              <div className={`result-pct ${!aWins ? 'win' : 'lose'}`}>{result.pctB}%</div>
              <div className="result-label">{!aWins ? 'FAVORED' : 'UNDERDOG'}</div>
              <div style={{ marginTop: 6 }}><SOLBadge team={b} /></div>
            </div>
          </div>

          {/* Tiebreaker callout */}
          {result.isClose ? (
            result.solFlipped ? (
              <div className="tiebreaker-box sol-wins">
                🔄 <strong>SOL Tiebreaker flipped this matchup.</strong> The base model gave{' '}
                <strong>{result.baseWinA > (1 - result.baseWinA) ? a.name : b.name}</strong> the edge (
                {(Math.max(result.baseWinA, 1 - result.baseWinA) * 100).toFixed(1)}%),
                but <strong>{aWins ? a.name : b.name}'s</strong> significantly stronger strength of losses (
                {(aWins ? a : b).solScore.toFixed(0)} vs {(aWins ? b : a).solScore.toFixed(0)})
                suggests they're more battle-tested — giving them the adjusted edge of{' '}
                <strong>{Math.max(parseFloat(result.pctA), parseFloat(result.pctB))}%</strong>.
              </div>
            ) : (
              <div className="tiebreaker-box too-close">
                ⚖️ <strong>Close matchup — SOL applied.</strong> This is within the tipping-point zone (spread &lt;12%).{' '}
                {a.solScore > b.solScore
                  ? <><strong>{a.name}</strong> has better strength of losses ({a.solScore.toFixed(0)} vs {b.solScore.toFixed(0)}), giving them a slight additional edge.</>
                  : a.solScore < b.solScore
                  ? <><strong>{b.name}</strong> has better strength of losses ({b.solScore.toFixed(0)} vs {a.solScore.toFixed(0)}), giving them a slight additional edge.</>
                  : <>Both teams have comparable strength of losses — no adjustment applied.</>
                }
              </div>
            )
          ) : (
            <div className="tiebreaker-box clear-fav">
              ✅ <strong>Clear favourite — SOL not a deciding factor.</strong> The {(Math.abs(result.adjWinA - result.adjWinB) * 100).toFixed(0)}-point spread is large enough that strength of losses ({a.solScore.toFixed(0)} vs {b.solScore.toFixed(0)}) doesn't change the outcome.
            </div>
          )}

          {/* Win probability bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>
              <span style={{ color: 'var(--blue)' }}>{a.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>Win Probability (SOL-adjusted)</span>
              <span style={{ color: 'var(--accent)' }}>{b.name}</span>
            </div>
            <div style={{ height: 28, borderRadius: 4, background: 'var(--accent)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', background: 'var(--blue)', width: `${result.pctA}%`, borderRadius: 4, transition: 'width 0.7s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
                <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{result.pctA}%</span>
              </div>
              <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'white', fontSize: 12, fontWeight: 700 }}>{result.pctB}%</span>
            </div>
          </div>

          {/* Projected score */}
          <div style={{ textAlign: 'center', background: 'var(--bg)', borderRadius: 6, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>Projected Score</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 600, letterSpacing: -1 }}>
              <span style={{ color: 'var(--blue)' }}>{a.name} {result.scoreA}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 20, margin: '0 10px' }}>—</span>
              <span style={{ color: 'var(--accent)' }}>{b.name} {result.scoreB}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Based on avg tempo of {avgPoss.toFixed(1)} possessions</div>
          </div>

          {/* Stat comparison */}
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-muted)', marginBottom: 12 }}>Head-to-Head Stat Comparison</div>
          {[
            { label: 'Adj Offense',        av: a.adjOE,         bv: b.adjOE,         higherBetter: true,  fmt: (v: number) => v.toFixed(1),              highlight: false },
            { label: 'Adj Defense',        av: a.adjDE,         bv: b.adjDE,         higherBetter: false, fmt: (v: number) => v.toFixed(1),              highlight: false },
            { label: 'Net Efficiency',     av: a.netEM,         bv: b.netEM,         higherBetter: true,  fmt: (v: number) => (v >= 0 ? '+' : '') + v.toFixed(1), highlight: false },
            { label: 'Tempo',              av: a.adjT,          bv: b.adjT,          higherBetter: null,  fmt: (v: number) => v.toFixed(1),              highlight: false },
            { label: 'Win Prob (Barthag)', av: a.barthag * 100, bv: b.barthag * 100, higherBetter: true,  fmt: (v: number) => v.toFixed(1) + '%',        highlight: false },
            { label: 'WAB',                av: a.wab,           bv: b.wab,           higherBetter: true,  fmt: (v: number) => (v >= 0 ? '+' : '') + v.toFixed(1), highlight: false },
            { label: 'Strength of Losses', av: a.solScore,      bv: b.solScore,      higherBetter: true,  fmt: (v: number) => v.toFixed(0) + '/100',     highlight: true },
          ].map(m => {
            const maxV = Math.max(Math.abs(m.av), Math.abs(m.bv), 0.1);
            const pA2 = Math.min(80, (Math.abs(m.av) / maxV) * 80);
            const pB2 = Math.min(80, (Math.abs(m.bv) / maxV) * 80);
            const aWinsM = m.higherBetter === null ? false : m.higherBetter ? m.av > m.bv : m.av < m.bv;
            const bWinsM = m.higherBetter === null ? false : !aWinsM && m.av !== m.bv;
            const rowStyle = m.highlight && result.isClose ? { background: 'var(--purple-light)', borderRadius: 6, padding: '4px 0' } : {};
            return (
              <div key={m.label} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', alignItems: 'center', gap: 8, marginBottom: 10, ...rowStyle }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: aWinsM ? 'var(--blue)' : 'var(--text-secondary)' }}>{m.fmt(m.av)}</span>
                  <div style={{ height: 8, borderRadius: 2, background: 'var(--blue)', width: pA2, opacity: aWinsM ? 1 : 0.4 }} />
                </div>
                <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: m.highlight ? 'var(--purple)' : 'var(--text-muted)' }}>
                  {m.label}{m.highlight && result.isClose ? ' ⚖️' : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ height: 8, borderRadius: 2, background: 'var(--accent)', width: pB2, opacity: bWinsM ? 1 : 0.4 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: bWinsM ? 'var(--accent)' : 'var(--text-secondary)' }}>{m.fmt(m.bv)}</span>
                </div>
              </div>
            );
          })}

          {/* Records */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
            <div style={{ background: 'var(--blue-light)', borderRadius: 4, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--blue)', fontWeight: 700, marginBottom: 3 }}>{a.name} Record</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue)' }}>{a.record}</div>
            </div>
            <div style={{ background: 'var(--accent-light)', borderRadius: 4, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--accent)', fontWeight: 700, marginBottom: 3 }}>{b.name} Record</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{b.record}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
