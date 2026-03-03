import json, datetime, urllib.request

# Fetch team data
req = urllib.request.Request(
    'https://barttorvik.com/2026_team_results.json',
    headers={'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache'}
)
with urllib.request.urlopen(req) as r:
    teams = json.loads(r.read().decode())

# Print first team to confirm which year we got
print(f"First team sample: {teams[0]}")
print(f"Total teams: {len(teams)}")

# Fetch player data
req2 = urllib.request.Request(
    'https://barttorvik.com/playerstat.php?year=2026&json=1&minmin=150',
    headers={'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache'}
)
with urllib.request.urlopen(req2) as r:
    content = r.read().decode().strip()
    try:
        players = json.loads(content)
        if isinstance(players, dict):
            players = players.get('data', players.get('players', []))
    except:
        players = []

print(f"Total players: {len(players)}")

out = {
    'teams': teams,
    'players': players,
    'updated': datetime.datetime.utcnow().isoformat()
}

with open('data.json', 'w') as f:
    json.dump(out, f)

print("Done!")
