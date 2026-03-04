import type { Team, RawTeamArray } from '../types';

export function parseTeams(raw: RawTeamArray[]): Team[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(r => {
    if (!Array.isArray(r)) return null;
    const rec = String(r[3] || '0-0').split('-');
    const w = parseInt(String(rec[0])) || 0;
    const l = parseInt(String(rec[1])) || 0;
    const adjOE = parseFloat(String(r[4])) || 0;
    const adjDE = parseFloat(String(r[6])) || 0;
    const barthag = parseFloat(String(r[8])) || 0;
    const netEM = parseFloat(String(r[10])) || (adjOE - adjDE);
    const oppO = parseFloat(String(r[23])) || 0;
    const oppD = parseFloat(String(r[24])) || 0;
    const sos = parseFloat(String(r[40])) || 0;
    const wab = parseFloat(String(r[38])) || 0;
    const adjT = parseFloat(String(r[42])) || 0;
    return {
      name: String(r[1] || ''),
      conf: String(r[2] || ''),
      w, l, record: `${w}–${l}`,
      adjOE, adjDE, netEM, barthag,
      sos, wab, adjT, oppO, oppD,
      raw: r,
    };
  }).filter((t): t is Team => t !== null && !!t.name && (t.w + t.l) > 0);
}
