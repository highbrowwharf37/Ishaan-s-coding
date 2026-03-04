import { useMemo } from 'react';
import type { TeamWithSOL } from '../../types';
import { pct } from '../../utils/formatting';
import BarCell from '../ui/BarCell';
import { Loading, ErrorBox } from '../ui/Loading';

interface Props {
  teamsWithSOL: TeamWithSOL[];
  status: string;
  error: string | null;
}

export default function ConferenceStrength({ teamsWithSOL, status, error }: Props) {
  const confs = useMemo(() => {
    const confMap: Record<string, TeamWithSOL[]> = {};
    teamsWithSOL.forEach(t => {
      if (!confMap[t.conf]) confMap[t.conf] = [];
      confMap[t.conf].push(t);
    });
    return Object.entries(confMap).map(([conf, teams]) => {
      const avgBarthag = teams.reduce((s, t) => s + t.barthag, 0) / teams.length;
      const avgEM = teams.reduce((s, t) => s + t.netEM, 0) / teams.length;
      const avgSOL = teams.reduce((s, t) => s + t.solScore, 0) / teams.length;
      const topTeam = [...teams].sort((a, b) => b.barthag - a.barthag)[0];
      return { conf, count: teams.length, avgBarthag, avgEM, avgSOL, topTeam };
    }).sort((a, b) => b.avgBarthag - a.avgBarthag);
  }, [teamsWithSOL]);

  const maxB = confs[0]?.avgBarthag ?? 1;
  const minB = confs[confs.length - 1]?.avgBarthag ?? 0;

  if (status === 'loading') return <Loading />;
  if (status === 'error' && error) return <ErrorBox message={error} />;

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Conference Strength Rankings</h1>
          <p>Each conference ranked by average Barthag + average strength of losses</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="sorted">Rk</th>
              <th>Conference</th>
              <th className="num">Teams</th>
              <th className="num has-tip" data-tip="Avg win prob vs D1">Avg Barthag</th>
              <th className="num">Avg Net EM</th>
              <th className="num has-tip" data-tip="Avg Strength of Losses across all conference teams">Conf SOL</th>
              <th>Best Team</th>
              <th className="num">Best Barthag</th>
            </tr>
          </thead>
          <tbody>
            {confs.map((c, i) => {
              const solLabel = c.avgSOL >= 65 ? 'Elite' : c.avgSOL >= 52 ? 'Good' : c.avgSOL >= 38 ? 'Avg' : 'Poor';
              const solCls   = c.avgSOL >= 65 ? 'sol-elite' : c.avgSOL >= 52 ? 'sol-good' : c.avgSOL >= 38 ? 'sol-avg' : 'sol-poor';
              return (
                <tr key={c.conf}>
                  <td className={`rank-cell${i < 5 ? ' top5' : ''}`}>{i + 1}</td>
                  <td className="team-cell">{c.conf}</td>
                  <td className="num">{c.count}</td>
                  <td className="num">
                    <BarCell
                      label={<strong>{(c.avgBarthag * 100).toFixed(1)}%</strong>}
                      percent={pct(c.avgBarthag, minB, maxB)}
                      color="blue"
                    />
                  </td>
                  <td className="num">{c.avgEM >= 0 ? '+' : ''}{c.avgEM.toFixed(1)}</td>
                  <td className="num"><span className={`sol-badge ${solCls}`}>{solLabel} ({c.avgSOL.toFixed(0)})</span></td>
                  <td>{c.topTeam?.name}</td>
                  <td className="num">{c.topTeam ? (c.topTeam.barthag * 100).toFixed(1) + '%' : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="data-note">Data: barttorvik.com · Conf SOL = avg strength-of-losses score across all member teams</p>
    </div>
  );
}
