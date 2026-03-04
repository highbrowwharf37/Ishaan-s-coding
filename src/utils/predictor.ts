import type { TeamWithSOL, PredictorResult } from '../types';

export function runPrediction(a: TeamWithSOL, b: TeamWithSOL): PredictorResult {
  const pA = a.barthag;
  const pB = b.barthag;
  const baseWinA = (pA - pA * pB) / (pA + pB - 2 * pA * pB);

  const spread = Math.abs(baseWinA - (1 - baseWinA));
  const isClose = spread < 0.12;

  const solDiff = (a.solScore - b.solScore) / 100;
  const solAdj = isClose ? solDiff * 0.06 : 0;
  const adjWinA = Math.max(0.02, Math.min(0.98, baseWinA + solAdj));
  const adjWinB = 1 - adjWinA;

  const baseAWins = baseWinA > (1 - baseWinA);
  const adjAWins  = adjWinA  > adjWinB;
  const solFlipped = baseAWins !== adjAWins;

  const pctA = (adjWinA * 100).toFixed(1);
  const pctB = (adjWinB * 100).toFixed(1);

  const avgPoss = (a.adjT + b.adjT) / 2;
  const scoreA = ((a.adjOE / 100) * (b.adjDE / 100) * avgPoss).toFixed(1);
  const scoreB = ((b.adjOE / 100) * (a.adjDE / 100) * avgPoss).toFixed(1);

  return { teamA: a, teamB: b, baseWinA, adjWinA, adjWinB, isClose, solFlipped, solAdj, scoreA, scoreB, pctA, pctB };
}
