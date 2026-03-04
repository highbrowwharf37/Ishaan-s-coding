import type { ReactNode } from 'react';

interface BarCellProps {
  label: ReactNode;
  percent: number;
  color: 'green' | 'red' | 'blue' | 'amber' | 'purple';
}

export default function BarCell({ label, percent, color }: BarCellProps) {
  return (
    <div className="bar-wrap">
      <span>{label}</span>
      <div className={`bar-bg bar-${color}`}>
        <div className="bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
