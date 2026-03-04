import { useState, useMemo } from 'react';
import type { TeamWithSOL } from '../../types';
import { pct, fmtSign } from '../../utils/formatting';
import SOLBadge from '../ui/SOLBadge';
import BarCell from '../ui/BarCell';
import { Loading, ErrorBox, Empty } from '../ui/Loading';

interface Props {
  teamsWithSOL: TeamWithSOL[];
  status: string;
  error: string | null;
}

export default function CinderellaWatch({ teamsWithSOL, status, error }: Props) {
  const [minSeed, setMinSeed] = useState(5);

  const { candidates, statCards } = useMemo(() => {
    const byBarthag = [...teamsWithSOL].sort((a, b) => b.barthag - a.barthag);
    const totalTeams = byBarthag.length;

    const withRank = byBarthag.map((t, i) => ({
      ...t,
      trueRank: i + 1,
      projSeed: Math.min(16, Math.ceil((i + 1) / 4)),
    }));

    const defRanks = [...teamsWithSOL].sort((a, b) => a.adjDE - b.adjDE);

    const cands = withRank
      .filter(t => t.projSeed >= minSeed && t.trueRank <= 80)
      .map(t => {
        const defRank = defRanks.findIndex(x => x.name === t.name) + 1;
        const defScore     = Math.max(0, (totalTeams - defRank) / totalTeams * 25);
        const barthagScore = t.barthag * 30;
        const tempoScore   = Math.max(0, 15 - Math.abs(t.adjT - 69) * 0.8);
        const wabScore     = Math.min(15, Math.max(0, t.wab * 2 + 5));
        const seedGapScore = Math.min(15, (t.projSeed - 1) * t.barthag * 10);
        const solScore2    = Math.min(15, (t.solScore / 100) * 15);
        const cinderellaScore = defScore + barthagScore + tempoScore + wabScore + seedGapScore + solScore2;
        const kenpomEst = (t.adjOE - t.adjDE).toFixed(1);
        return { ...t, defRank, cinderellaScore, kenpomEst };
      })
      .sort((a, b) => b.cinderellaScore - a.cinderellaScore)
      .slice(0, 20);

    const top = cands[0];
    const bestDef = [...cands].sort((a, b) => a.adjDE - b.adjDE)[0];
    const bestWAB = [...cands].sort((a, b) => b.wab - a.wab)[0];
    const bestSOL = [...cands].sort((a, b) => b.solScore - a.solScore)[0];

    return { candidates: cands, statCards: { top, bestDef, bestWAB, bestSOL } };
  }, [teamsWithSOL, minSeed]);

  if (status === 'loading') return <Loading />;
  if (status === 'error' && error) return <ErrorBox message={error} />;

  const maxScore = candidates[0]?.cinderellaScore ?? 1;
  const minScore = candidates[candidates.length - 1]?.cinderellaScore ?? 0;

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>🥿 Cinderella Watch</h1>
          <p>Teams most likely to make a deep tournament run — including strength of losses as a key factor</p>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 6, padding: '18px 20px', marginBottom: 20, fontSize: 13, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>How we identify Cinderella teams:</strong><br />
        Research shows the best statistical predictors of tournament upsets are: <strong>Adjusted Efficiency Margin</strong>, <strong>Defensive Efficiency</strong>, <strong>Barthag vs Seed Gap</strong>, <strong>Tempo Control</strong>, <strong>Schedule-adjusted WAB</strong>, and now <strong>Strength of Losses</strong> — teams whose losses came against elite opponents are far better bets to beat a favored team than those who folded against weak competition. The <em>Cinderella Score</em> is a composite of all six factors.
      </div>

      {statCards.top && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-label">Top Cinderella Pick</div>
            <div className="stat-card-value" style={{ color: 'var(--accent)', fontSize: 18 }}>{statCards.top.name}</div>
            <div className="stat-card-sub">Score: {statCards.top.cinderellaScore.toFixed(1)} · Seed {statCards.top.projSeed}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Best Defense</div>
            <div className="stat-card-value" style={{ color: 'var(--blue)', fontSize: 18 }}>{statCards.bestDef?.name}</div>
            <div className="stat-card-sub">Adj DE: {statCards.bestDef?.adjDE.toFixed(1)} · Rank #{statCards.bestDef?.defRank}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Most Battle-Tested</div>
            <div className="stat-card-value" style={{ color: 'var(--green)', fontSize: 18 }}>{statCards.bestWAB?.name}</div>
            <div className="stat-card-sub">WAB: +{statCards.bestWAB?.wab.toFixed(1)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Best Loss Quality</div>
            <div className="stat-card-value" style={{ color: 'var(--purple)', fontSize: 18 }}>{statCards.bestSOL?.name}</div>
            <div className="stat-card-sub">SOL {statCards.bestSOL?.solScore.toFixed(0)}/100 — {statCards.bestSOL?.solLabel}</div>
          </div>
        </div>
      )}

      <div className="filters">
        <label>Min Projected Seed</label>
        <select value={minSeed} onChange={e => setMinSeed(parseInt(e.target.value))}>
          <option value={5}>5+ seed (any underdog)</option>
          <option value={8}>8+ seed</option>
          <option value={10}>10+ seed (true Cinderella)</option>
          <option value={12}>12+ seed (major upset)</option>
        </select>
      </div>

      {candidates.length === 0 ? (
        <Empty message="No candidates found for selected seed range." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rk</th>
                <th>Team</th>
                <th>Conf</th>
                <th className="num has-tip" data-tip="Estimated NCAA seed">Proj Seed</th>
                <th className="num has-tip" data-tip="Actual strength rank">True Rank</th>
                <th className="num has-tip" data-tip="Composite upset potential (now includes SOL)">Cinderella Score</th>
                <th className="num has-tip" data-tip="Net efficiency (KenPom-style)">KenPom Est.</th>
                <th className="num has-tip" data-tip="Defensive efficiency rank">Adj DE</th>
                <th className="num has-tip" data-tip="Win prob vs avg D1">Barthag</th>
                <th className="num">Tempo</th>
                <th className="num">WAB</th>
                <th className="num has-tip" data-tip="Strength of Losses — quality of opponents when this team lost">SOL</th>
                <th className="num">Record</th>
                <th className="num">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((t, i) => {
                const verdict = i === 0 ? '🥿 #1 Pick' : i < 3 ? '⭐ Elite' : i < 7 ? '🔥 Strong' : i < 12 ? '👀 Watch' : '💡 Sleeper';
                const kenpomVal = parseFloat(t.kenpomEst);
                return (
                  <tr key={t.name}>
                    <td className={`rank-cell${i < 3 ? ' top5' : ''}`}>{i + 1}</td>
                    <td className="team-cell">{t.name}</td>
                    <td><span className="pill pill-blue">{t.conf}</span></td>
                    <td className="num">
                      <span className={`pill ${t.projSeed <= 4 ? 'pill-red' : t.projSeed <= 8 ? 'pill-amber' : 'pill-green'}`}>
                        #{t.projSeed} seed
                      </span>
                    </td>
                    <td className="num">#{t.trueRank}</td>
                    <td className="num">
                      <BarCell label={<strong>{t.cinderellaScore.toFixed(1)}</strong>} percent={pct(t.cinderellaScore, minScore, maxScore)} color="amber" />
                    </td>
                    <td className="num">
                      <strong style={{ color: kenpomVal > 15 ? 'var(--green)' : kenpomVal > 5 ? 'var(--amber)' : 'var(--text-primary)' }}>
                        {fmtSign(kenpomVal)}
                      </strong>
                    </td>
                    <td className="num">
                      {t.adjDE.toFixed(1)} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>#{t.defRank}</span>
                    </td>
                    <td className="num">{(t.barthag * 100).toFixed(1)}%</td>
                    <td className="num">{t.adjT.toFixed(1)}</td>
                    <td className="num">
                      <span className={`pill ${t.wab >= 0 ? 'pill-green' : 'pill-red'}`}>
                        {fmtSign(t.wab)}
                      </span>
                    </td>
                    <td className="num"><SOLBadge team={t} /></td>
                    <td className="num">{t.record}</td>
                    <td className="num">{verdict}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="data-note">Cinderella Score = composite of AdjEM vs seed gap, defensive efficiency rank, barthag, tempo control, WAB, and Strength of Losses. Higher = more upset potential.</p>
    </div>
  );
}
