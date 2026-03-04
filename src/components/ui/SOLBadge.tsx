import type { TeamWithSOL } from '../../types';

interface SOLBadgeProps {
  team: TeamWithSOL;
}

export default function SOLBadge({ team }: SOLBadgeProps) {
  return (
    <span className={`sol-badge ${team.solClass}`}>
      {team.solLabel} ({team.solScore.toFixed(0)})
    </span>
  );
}
