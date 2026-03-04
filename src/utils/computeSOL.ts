import type { Team, TeamWithSOL } from '../types';

export function computeSOL(teams: Team[]): TeamWithSOL[] {
  if (!teams.length) return [];

  const maxOppO = Math.max(...teams.map(t => t.oppO));
  const minOppO = Math.min(...teams.map(t => t.oppO));
  const maxOppD = Math.max(...teams.map(t => t.oppD));
  const minOppD = Math.min(...teams.map(t => t.oppD));
  const maxSos  = Math.max(...teams.map(t => t.sos));
  const minSos  = Math.min(...teams.map(t => t.sos));

  return teams.map(t => {
    const nOppO = maxOppO > minOppO ? (t.oppO - minOppO) / (maxOppO - minOppO) : 0.5;
    const nOppD = maxOppD > minOppD ? 1 - (t.oppD - minOppD) / (maxOppD - minOppD) : 0.5;
    const nSos  = maxSos  > minSos  ? (t.sos  - minSos)  / (maxSos  - minSos)  : 0.5;

    const rawSOL = nOppO * 0.5 + nOppD * 0.3 + nSos * 0.2;

    const totalG = t.w + t.l;
    const actualWP = totalG > 0 ? t.w / totalG : 0;
    const gap = actualWP - t.barthag;
    const penalty = Math.max(0, Math.min(0.2, -gap * 1.3));

    const solScore = Math.max(0, Math.min(100, (rawSOL - penalty) * 100));

    let solLabel: TeamWithSOL['solLabel'];
    let solClass: TeamWithSOL['solClass'];
    if (solScore >= 72)      { solLabel = 'Elite';   solClass = 'sol-elite'; }
    else if (solScore >= 55) { solLabel = 'Good';    solClass = 'sol-good';  }
    else if (solScore >= 38) { solLabel = 'Average'; solClass = 'sol-avg';   }
    else                     { solLabel = 'Poor';    solClass = 'sol-poor';  }

    return { ...t, solScore, solLabel, solClass };
  });
}
