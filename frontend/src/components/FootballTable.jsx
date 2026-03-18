import { formatNumber } from '../utils/dataLoader';

function getPositionClass(position) {
  if (position === 'QB') return 'pill-red';
  if (position === 'RB') return 'pill-green';
  if (position === 'WR') return 'pill-blue';
  if (position === 'TE') return 'pill-orange';
  return 'pill-amber';
}

export default function FootballTable({ data, startIndex = 0 }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="num" style={{ width: '40px' }}>#</th>
            <th style={{ minWidth: '180px' }}>Player</th>
            <th className="num">Season</th>
            <th>Team</th>
            <th>Pos</th>
            <th className="num">GP</th>
            <th className="num">AVG</th>
            <th className="num">TTL</th>
          </tr>
        </thead>
        <tbody>
          {data.map((player, idx) => {
            const rowNumber = startIndex + idx + 1;

            return (
              <tr key={`${player.player}-${player.season}-${idx}`} className={rowNumber <= 10 ? 'highlight-row' : ''}>
                <td className={`num rank-cell ${rowNumber <= 5 ? 'top5' : ''}`}>{rowNumber}</td>
                <td className="player-cell">{player.player}</td>
                <td className="num">{player.season}</td>
                <td>{player.team}</td>
                <td>
                  <span className={`pill ${getPositionClass(player.position)}`}>{player.position}</span>
                </td>
                <td className="num">{player.gp}</td>
                <td className="num" style={{ fontWeight: '700', color: 'var(--accent)' }}>
                  {formatNumber(player.avg, 1)}
                </td>
                <td className="num" style={{ fontWeight: '700' }}>
                  {formatNumber(player.ttl, 1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
