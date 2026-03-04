import { useMemo } from 'react';
import type { TeamWithSOL } from '../../types';
import SOLBadge from '../ui/SOLBadge';
import { Loading, ErrorBox } from '../ui/Loading';

interface Props {
  teamsWithSOL: TeamWithSOL[];
  status: string;
  error: string | null;
}

interface BubbleTeam extends TeamWithSOL { adjWAB: number; }

export default function BubbleTracker({ teamsWithSOL, status, error }: Props) {
  const { inTourney, onBubble, outTourney } = useMemo(() => {
    const adjusted: BubbleTeam[] = teamsWithSOL.map(t => ({
      ...t,
      adjWAB: t.wab + ((t.solScore - 50) / 100) * 0.6,
    })).sort((a, b) => b.adjWAB - a.adjWAB);

    return {
      inTourney:  adjusted.filter(t => t.adjWAB >= 2.0).slice(0, 20),
      onBubble:   adjusted.filter(t => t.adjWAB >= -1.0 && t.adjWAB < 2.0).slice(0, 16),
      outTourney: adjusted.filter(t => t.adjWAB < -1.0).slice(0, 16),
    };
  }, [teamsWithSOL]);

  if (status === 'loading') return <Loading />;
  if (status === 'error' && error) return <ErrorBox message={error} />;

  const makeList = (teams: BubbleTeam[]) => teams.map(t => (
    <div key={t.name} className="bubble-row">
      <div>
        <span className="bubble-name">{t.name}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}> {t.conf}</span>
        <span style={{ marginLeft: 6 }}><SOLBadge team={t} /></span>
      </div>
      <div className="bubble-wab">
        {t.record} · WAB {t.adjWAB >= 0 ? '+' : ''}{t.adjWAB.toFixed(1)}{' '}
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>(adj)</span>
      </div>
    </div>
  ));

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>NCAA Tournament Bubble Tracker</h1>
          <p>In / On the bubble / Out — based on WAB, SOS, efficiency, and strength of losses</p>
        </div>
      </div>
      <div className="bubble-cols">
        <div>
          <div className="bubble-col-head bubble-in-head">✓ In the Tournament ({inTourney.length})</div>
          <div className="bubble-list">{makeList(inTourney)}</div>
        </div>
        <div>
          <div className="bubble-col-head bubble-edge-head">⚠ On the Bubble ({onBubble.length})</div>
          <div className="bubble-list">{makeList(onBubble)}</div>
        </div>
        <div>
          <div className="bubble-col-head bubble-out-head">✗ On the Outside ({outTourney.length})</div>
          <div className="bubble-list">{makeList(outTourney)}</div>
        </div>
      </div>
      <p className="data-note">Bubble status based on Wins Above Bubble (WAB) + Strength of Losses adjustment from Barttorvik</p>
    </div>
  );
}
