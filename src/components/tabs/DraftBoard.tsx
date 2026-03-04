import { useState } from 'react';
import { draftProspects } from '../../data/draftProspects';

export default function DraftBoard() {
  const [posFilter, setPosFilter] = useState('');
  const [roundFilter, setRoundFilter] = useState('');

  let prospects = [...draftProspects];
  if (posFilter) prospects = prospects.filter(p => p.pos.includes(posFilter));
  if (roundFilter === 'lottery') prospects = prospects.filter(p => p.pick <= 14);
  if (roundFilter === 'first')   prospects = prospects.filter(p => p.pick <= 30);

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>🏀 2026 NBA Draft Board</h1>
          <p>Top prospects ranked by draft position · Includes team fit analysis · Updated March 2026</p>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 20px', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <strong style={{ color: 'var(--text-primary)' }}>About this board:</strong> The 2026 NBA Draft is widely considered one of the deepest in years. The top three — <strong>AJ Dybantsa</strong>, <strong>Darryn Peterson</strong>, and <strong>Cameron Boozer</strong> — are all legitimate No. 1 pick candidates with franchise-altering upside. Team assignments are based on current lottery projections and team needs as of March 2026.
      </div>

      <div className="filters">
        <label>Filter</label>
        <select value={posFilter} onChange={e => setPosFilter(e.target.value)}>
          <option value="">All Positions</option>
          <option value="PG">Point Guard</option>
          <option value="SG">Shooting Guard</option>
          <option value="SF">Small Forward</option>
          <option value="PF">Power Forward</option>
          <option value="C">Center</option>
        </select>
        <label>Round</label>
        <select value={roundFilter} onChange={e => setRoundFilter(e.target.value)}>
          <option value="">All Picks</option>
          <option value="lottery">Lottery (1-14)</option>
          <option value="first">Full 1st Round</option>
        </select>
      </div>

      {prospects.length === 0 ? (
        <div className="loading-bar">No prospects match your filters.</div>
      ) : (
        prospects.map(p => (
          <div key={p.pick} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', alignItems: 'stretch' }}>
              <div style={{ background: p.tierColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '16px 8px', minWidth: 60 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Pick</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'white', fontFamily: 'var(--font-serif)', lineHeight: 1 }}>{p.pick}</div>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600 }}>{p.name}</span>
                  <span className="pill pill-blue">{p.pos}</span>
                  <span className="pill pill-amber">{p.school}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.ht} · {p.wt} lbs · Age {p.age}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8, marginBottom: 10 }}>
                  {[['PPG', p.ppg.toFixed(1)], ['RPG', p.rpg.toFixed(1)], ['APG', p.apg.toFixed(1)], ['FG%', p.fg + '%'], ['TS%', p.tsp + '%'], ['Wingspan', p.wingspan]].map(([l, v]) => (
                    <div key={l} style={{ background: 'var(--bg)', borderRadius: 3, padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-muted)', fontWeight: 700 }}>{l}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--blue-light)', borderRadius: 4, padding: '10px 12px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--blue)' }}>→ {p.team}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Need: {p.teamNeed}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.analysis}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  NBA Comp: <strong style={{ color: 'var(--text-secondary)' }}>{p.nbaComp}</strong>
                  {' · '}
                  <span style={{ color: p.tierColor, fontWeight: 700 }}>{p.tier} Projection</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      <p className="data-note">Sources: ESPN, CBS Sports, Bleacher Report, Babcock Hoops · Team needs based on current standings · March 2026</p>
    </div>
  );
}
