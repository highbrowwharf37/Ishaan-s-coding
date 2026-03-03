import json, datetime, urllib.request

# Fetch team data
req = urllib.request.Request(
    'https://barttorvik.com/2026_team_results.json',
    headers={'User-Agent': 'Mozilla/5.0'}
)
with urllib.request.urlopen(req) as r:
    teams = json.loads(r.read().decode())

# Fetch player data  
req2 = urllib.request.Request(
    'https://barttorvik.com/playerstat.php?year=2026&json=1&minmin=150',
    headers={'User-Agent': 'Mozilla/5.0'}
)
with urllib.request.urlopen(req2) as r:
    content = r.read().decode().strip()
    try:
        players = json.loads(content)
        if isinstance(players, dict):
            players = players.get('data', players.get('players', []))
    except:
        players = []

out = {
    'teams': teams,
    'players': players,
    'updated': datetime.datetime.utcnow().isoformat()
}

with open('data.json', 'w') as f:
    json.dump(out, f)

print(f"Done! {len(teams)} teams, {len(players)} players")
