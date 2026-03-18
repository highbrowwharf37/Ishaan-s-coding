## NBA Stats Dashboard — Quick Setup Guide

### What Was Created

✅ **nba_stats.html** - Interactive dashboard showing NBA player fantasy statistics
   - Main page: All-time leaders across all seasons
   - Second page: Season-by-season breakdowns with year toggle

✅ **build_nba_json.py** - Converts CSV data to JSON format (required)

✅ **serve.py** - Local development server for viewing the dashboards

✅ **frontend/public/nba_data/** - Generated directory with JSON data files

### Setup Instructions

#### Step 1: Generate Data Files
Run this command once to convert your CSV files to JSON:

```bash
python build_nba_json.py
```

Expected output:
```
✓ Created frontend\public\nba_data\nba_stats_full.json (12767 records)
✓ Created frontend\public\nba_data\nba_stats_2024-25.json (569 records)
✓ Created frontend\public\nba_data\nba_stats_2023-24.json (572 records)
... (more seasons)
✓ Created frontend\public\nba_data\manifest.json
```

#### Step 2: Start the Server
In a terminal, run:

```bash
python serve.py
```

You'll see:
```
🚀 Server running at http://localhost:8000
📊 Open http://localhost:8000/nba_stats.html in your browser
   Press Ctrl+C to stop the server
```

#### Step 3: Open in Browser
- **NBA Stats Dashboard:** http://localhost:8000/nba_stats.html
- **CBB Rankings:** http://localhost:8000/cbb-rankings.html

### Dashboard Features

#### All-Time Leaders Tab
- Shows top 100 players across all available seasons
- Sort by:
  - Fantasy Points Per Game (FP/G)
  - Total Fantasy Points
  - Total Points
  - Rebounds
  - Assists
- Filter by minimum games played (10, 25, 50, or all)
- Top 10 highlighted in blue

#### By Season Tab
- Select any season from 2000-01 to 2025-26
- Shows top performers for that season
- Sort by FP/G, Total FP, or Points
- Season name displayed next to each player

### Design Notes

The dashboard matches the style of your CBB Rankings page with:
- Same serif + sans-serif typography
- Consistent color scheme (red accent, green, blue, amber, purple)
- Responsive table layouts
- Professional data visualization

### Updating Data

If you add new CSV files to `Past Fantasy Data/`:

1. Place the CSV file in `Past Fantasy Data/` folder
   - Format: `nba_stats_YYYY-YY.csv`
2. Run: `python build_nba_json.py`
3. Refresh the dashboard in your browser

The new season will automatically appear in the season selector.

### Fantasy Points Formula

The dashboard uses this scoring:
```
FP = PTS + (0.5 × REB) + (1.5 × AST) − (0.25 × TOV) + (2 × STL) + (2 × BLK) + (3 × FG3M)
```

### Troubleshooting

**Q: Data not loading?**
- Make sure you ran `python build_nba_json.py` first
- Check that `frontend/public/nba_data/` exists and contains JSON files
- Try refreshing the page (Ctrl+R)

**Q: Changes to CSV files not showing?**
- Run `python build_nba_json.py` again
- This regenerates JSON files from your CSVs
- Then refresh the dashboard

**Q: Server won't start?**
- Make sure port 8000 is not in use
- Try: `python serve.py` (usually works on any machine)

### Need Help?

- Check the data files are in `Past Fantasy Data/` folder
- Verify JSON files were created in `frontend/public/nba_data/`
- Make sure the server is running (you should see the message)
- Try a different browser if you encounter issues
