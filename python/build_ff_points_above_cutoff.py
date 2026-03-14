#!/usr/bin/env python3
"""
Build a CSV in the same wide format as the source fantasy football files,
but with each weekly cell replaced by the number of points above that week's
positional cutoff.

Cutoffs:
- RB/WR: 25th-highest scorer each week
- QB/TE: 13th-highest scorer each week
"""

from __future__ import annotations

import csv
from pathlib import Path
from typing import Dict, List


ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "Past FF Data"
OUTPUT_FILE = DATA_DIR / "player_points_above_cutoff.csv"

POSITION_CUTOFFS = {
    "RB": 25,
    "WR": 25,
    "QB": 13,
    "TE": 13,
}

WEEK_COLUMNS = [str(week) for week in range(1, 19)]


def parse_points(raw_value: str | None) -> float | None:
    if raw_value is None:
        return None

    value = raw_value.strip()
    if value in {"", "-", "BYE"}:
        return None
    return float(value)


def format_points(value: float) -> str:
    formatted = f"{value:.1f}"
    if formatted.endswith(".0"):
        return formatted[:-2]
    return formatted


def load_rows(file_path: Path) -> List[dict]:
    with file_path.open(newline="", encoding="utf-8-sig") as csv_file:
        rows = []
        for row in csv.DictReader(csv_file):
            player = (row.get("Player") or "").strip()
            if player:
                rows.append(row)
        return rows


def collect_weekly_scores(rows: List[dict]) -> Dict[str, List[float]]:
    weekly_scores: Dict[str, List[float]] = {week: [] for week in WEEK_COLUMNS}

    for row in rows:
        for week in WEEK_COLUMNS:
            points = parse_points(row.get(week))
            if points is not None:
                weekly_scores[week].append(points)

    for scores in weekly_scores.values():
        scores.sort(reverse=True)

    return weekly_scores


def cutoff_for_week(scores: List[float], rank: int) -> float | None:
    if not scores:
        return None
    if len(scores) < rank:
        return scores[-1]
    return scores[rank - 1]


def season_from_name(file_path: Path) -> str:
    return file_path.stem[:4]


def position_from_name(file_path: Path) -> str:
    return file_path.stem[4:].upper()


def build_player_row(
    season: str,
    position: str,
    source_row: dict,
    weekly_cutoffs: Dict[str, float | None],
) -> dict:
    numeric_diffs: List[float] = []
    player_row = {
        "season": season,
        "#": "",
        "Player": (source_row.get("Player") or "").strip(),
        "Pos": position,
        "Team": (source_row.get("Team") or "").strip(),
        "GP": (source_row.get("GP") or "").strip(),
    }

    for week in WEEK_COLUMNS:
        raw_value = (source_row.get(week) or "").strip()
        points = parse_points(raw_value)
        cutoff_points = weekly_cutoffs[week]

        if points is None or cutoff_points is None:
            player_row[week] = raw_value
            continue

        diff = points - cutoff_points
        numeric_diffs.append(diff)
        player_row[week] = format_points(diff)

    total = sum(numeric_diffs)
    average = total / len(numeric_diffs) if numeric_diffs else 0.0
    player_row["AVG"] = format_points(average)
    player_row["TTL"] = format_points(total)

    return player_row


def played_game_count(row: dict) -> int:
    return sum(1 for week in WEEK_COLUMNS if parse_points(row.get(week)) is not None)


def best_week_value(row: dict) -> float | None:
    values = []
    for week in WEEK_COLUMNS:
        value = parse_points(row.get(week))
        if value is not None:
            values.append(value)
    if not values:
        return None
    return max(values)


def should_keep_row(row: dict) -> bool:
    position = row["Pos"]
    games_played = played_game_count(row)
    best_week = best_week_value(row)

    if best_week is None:
        return False

    if position == "RB":
        if games_played <= 4 and best_week <= -5:
            return False
        return True

    if position == "TE":
        if games_played <= 5 and best_week <= -4:
            return False
        return True

    if position == "WR":
        if best_week <= -8:
            return False
        if games_played <= 5 and best_week <= -4:
            return False
        return True

    if position == "QB":
        if games_played <= 5 and best_week <= -6:
            return False
        return True

    return True


def build_output_rows() -> List[dict]:
    output_rows: List[dict] = []

    for file_path in sorted(DATA_DIR.glob("*.csv")):
        position = position_from_name(file_path)
        if position not in POSITION_CUTOFFS:
            continue

        season = season_from_name(file_path)
        source_rows = load_rows(file_path)
        weekly_scores = collect_weekly_scores(source_rows)
        weekly_cutoffs = {
            week: cutoff_for_week(scores, POSITION_CUTOFFS[position])
            for week, scores in weekly_scores.items()
        }

        file_rows = [
            build_player_row(season, position, source_row, weekly_cutoffs)
            for source_row in source_rows
        ]
        file_rows = [row for row in file_rows if should_keep_row(row)]

        file_rows.sort(
            key=lambda row: (
                row["season"],
                row["Pos"],
                -float(row["AVG"]),
                row["Player"],
            )
        )

        for index, row in enumerate(file_rows, start=1):
            row["#"] = str(index)

        output_rows.extend(file_rows)

    return output_rows


def write_output(rows: List[dict]) -> None:
    fieldnames = [
        "season",
        "#",
        "Player",
        "Pos",
        "Team",
        "GP",
        *WEEK_COLUMNS,
        "AVG",
        "TTL",
    ]

    with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    rows = build_output_rows()
    write_output(rows)
    print(f"Wrote {len(rows)} player rows to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
