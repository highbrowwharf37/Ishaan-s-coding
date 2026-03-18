#!/usr/bin/env python3
"""
Convert football points-above-cutoff CSV data to JSON for the frontend.
"""

import csv
import json
from pathlib import Path


def main():
    root_dir = Path(__file__).resolve().parent.parent
    csv_path = root_dir / "Past FF Data" / "player_points_above_cutoff.csv"
    output_dir = root_dir / "frontend" / "public" / "ff_data"
    output_dir.mkdir(parents=True, exist_ok=True)

    with csv_path.open("r", encoding="utf-8-sig", newline="") as csv_file:
        rows = list(csv.DictReader(csv_file))

    output_path = output_dir / "player_points_above_cutoff.json"
    with output_path.open("w", encoding="utf-8") as json_file:
        json.dump(rows, json_file, indent=2)

    print(f"Created {output_path} ({len(rows)} records)")


if __name__ == "__main__":
    main()
