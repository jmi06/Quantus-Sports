from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from app.cache import cache
from app.config import CORE_CONFIG
from app.utils.core.ratings import *


def powerrankings(sport, days_back):
    K_mult= CORE_CONFIG[sport]['k_mult']

    now = int(datetime.now().timestamp())
    deltatime = abs(int(cache[sport][f'{days_back}daypowerrankings']['timestamp'])-now)

    if deltatime < 300:
        print('from cache power')
        league_data = cache[sport]['7daypowerrankings']['data']
    else:
        print('fetching it power')
        league_data = fetch_ratings(sport)
        cache[sport]['7daypowerrankings']['data'] = league_data
        cache[sport]['7daypowerrankings']['timestamp'] = now
    
    team_ratings = {}
    relevant_games = []
    eastern = ZoneInfo("America/New_York")
    now = datetime.now(eastern)
    games = league_data['games']

    for key, value in league_data['all'].items():
        team_ratings[key] = {"rating": value['elo'], "name": key}

    for key, value in league_data['games'].items():
        game_timestamp = datetime.fromisoformat(value["date"]).astimezone(eastern)
        x_days_ago = now - timedelta(days=days_back)
        
        if x_days_ago <= game_timestamp <= now:
            relevant_games.append(key)


    for game in relevant_games:
        team1rating = team_ratings[games[game]["team_1"]["team_name"]]['rating']
        team2rating = team_ratings[games[game]["team_2"]["team_name"]]['rating']

        team1winprob = 1/(1+10**((float(team2rating)-float(team1rating))/400))
        team2winprob = 1/(1+10**((float(team1rating)-float(team2rating))/400))

        if games[game]["team_1"]['winner'] == False:
            team1W = 0
            team2W = 1
        else:
            team1W = 1
            team2W = 0
            
        K = K_mult * games[game]["points_diff"]
        
        team1newrating = team1rating + K * (team1W-team1winprob)
        team2newrating = team2rating + K * (team2W-team2winprob)

        team_ratings[games[game]["team_1"]["team_name"]]['rating'] = round(team1newrating,2)
        team_ratings[games[game]["team_2"]["team_name"]]['rating'] = round(team2newrating,2)


    sorted_teams = dict(sorted(
        team_ratings.items(), 
        key=lambda item: item[1]['rating'], 
        reverse=True
    ))
    print(list(sorted_teams.items()))
    return list(sorted_teams.items())
