import type { Player, RawPlayerArray } from '../types';

export function parsePlayers(raw: RawPlayerArray[]): Player[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map(r => ({
    name:  String(r[0]  || ''),
    team:  String(r[1]  || ''),
    conf:  String(r[2]  || ''),
    gp:    parseInt(String(r[3]))  || 0,
    min:   parseFloat(String(r[4])) || 0,
    ortg:  parseFloat(String(r[5])) || 0,
    usg:   parseFloat(String(r[6])) || 0,
    efg:   parseFloat(String(r[7])) || 0,
    ts:    parseFloat(String(r[8])) || 0,
    ppg:   parseFloat(String(r[9])) || 0,
    rpg:   parseFloat(String(r[10])) || 0,
    apg:   parseFloat(String(r[11])) || 0,
    bpm:   parseFloat(String(r[14])) || 0,
    obpm:  parseFloat(String(r[15])) || 0,
    dbpm:  parseFloat(String(r[16])) || 0,
    pos:   String(r[17] || ''),
    yr:    String(r[18] || ''),
  })).filter(p => p.name && p.gp >= 3);
}
