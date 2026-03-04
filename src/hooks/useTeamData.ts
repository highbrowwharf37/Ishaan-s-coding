import { useState, useEffect, useMemo } from 'react';
import type { DataState, Team, Player } from '../types';
import { parseTeams } from '../utils/parseTeams';
import { parsePlayers } from '../utils/parsePlayers';
import { computeSOL } from '../utils/computeSOL';

const DATA_URL = import.meta.env.DEV
  ? '/data/data.json'
  : 'https://raw.githubusercontent.com/highbrowwharf37/Ishaan-s-coding/main/data/data.json';

export function useTeamData() {
  const [state, setState] = useState<DataState>({
    teams: [],
    players: [],
    updated: null,
    status: 'loading',
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${DATA_URL}?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        setState({
          teams: parseTeams(json.teams || []) as Team[],
          players: parsePlayers(json.players || []) as Player[],
          updated: json.updated || null,
          status: 'success',
          error: null,
        });
      } catch (err) {
        if (!cancelled) {
          setState(s => ({ ...s, status: 'error', error: (err as Error).message }));
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Pre-compute SOL over the full team set (used by Predictor, H2H, Bubble, Upset, ConfStrength, Cinderella)
  const teamsWithSOL = useMemo(
    () => state.status === 'success' ? computeSOL(state.teams) : [],
    [state.teams, state.status]
  );

  const conferences = useMemo(
    () => [...new Set(state.teams.map(t => t.conf))].sort(),
    [state.teams]
  );

  const updatedLabel = state.updated
    ? `Live · ${new Date(state.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : state.status === 'loading' ? 'Loading...' : 'Data unavailable';

  return { ...state, teamsWithSOL, conferences, updatedLabel };
}
