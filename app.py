from flask import Flask, render_template, request, jsonify
import os
import requests
import time
from datetime import timezone, datetime, timedelta
from zoneinfo import ZoneInfo


app = Flask(__name__)

cache={
    "upcoming":{
        "data":{

        },
        "timestamp": 0
    },
    "livegames":{
        "data":{

        },
        "timestamp":0
    },
    "NBAbasketball":{
        "rankings":{
            "data":{},
            "timestamp": 0,
        },
        "7daypowerrankings":{
            "data":{},
            "timestamp":0,
        },
        "14daypowerrankings":{
            "data":{},
            "timestamp":0,
        },
        "30daypowerrankings":{
            "data":{},
            "timestamp":0,
        },
        "games":{
            "data":{},
            "timestamp":0,
        },
        "timestamp":0
    },
    "NHLhockey":{
        "rankings":{
            "data":{},
            "timestamp": 0,
        },
        "7daypowerrankings":{
            "data":{},
            "timestamp":0,
        },
        "14daypowerrankings":{
            "data":{},
            "timestamp":0,
        },
        "30daypowerrankings":{
            "data":{},
            "timestamp":0,
        },
        "games":{
            "data":{},
            "timestamp":0,
        },

        "timestamp":0
    },
    "MLBbaseball":{
        "rankings":{
            "data":{},
            "timestamp": 0,
        },
        "7daypowerrankings":{
            "data":{},
            "timestamp":0,
        },
        "14daypowerrankings":{
            "data":{},
            "timestamp":0,
        },
        "30daypowerrankings":{
            "data":{},
            "timestamp":0,
        },
        "games":{
            "data":{},
            "timestamp":0,
        },


        "timestamp":0
    },



}

def fetch_live():
    return

def fetch_upcoming():
    return

def fill_ticker():
    ticker_data = []
    # If theres games on now, get them and give the win prob
    # Otherwise give upcoming games

    livegames = fetch_live()
    upcoming = fetch_upcoming()




    return ticker_data

def fetch_ratings(sport):
    url=""
    if sport == "NHLhockey":
        url = "https://shy-recipe-1436.jmi06.workers.dev/"
    elif sport == "NBAbasketball":
        url = "https://dark-mountain-23d8.jmi06.workers.dev/"
    elif sport == "MLBbaseball":
        url = "https://falling-frog-ec91.jmi06.workers.dev/"

    now = int(datetime.now().timestamp())
    deltatime = abs(int(cache[sport]['rankings']['timestamp'])-now)

    if deltatime < 300:
        print('from cache')
        return cache[sport]['rankings']['data']
    else:
        print('fetching it')
        response = requests.get(url)
        cache[sport]['rankings']['data'] = response.json()
        cache[sport]['rankings']['timestamp'] = now
        return response.json()



def seven_day_powerrankings(sport):
    if sport == "MLBbaseball":
        K_mult = 64
    elif sport == "NHLhockey":
        K_mult = 128
    elif sport == "NBAbasketball":
        K_mult = 32 


    now = int(datetime.now().timestamp())
    deltatime = abs(int(cache[sport]['7daypowerrankings']['timestamp'])-now)

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
        seven_days_ago = now - timedelta(days=7)
        
        if seven_days_ago <= game_timestamp <= now:
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



def fourteen_day_powerrankings(sport):
    if sport == "MLBbaseball":
        K_mult = 64
    elif sport == "NHLhockey":
        K_mult = 128
    elif sport == "NBAbasketball":
        K_mult = 32 


    now = int(datetime.now().timestamp())
    deltatime = abs(int(cache[sport]['14daypowerrankings']['timestamp'])-now)

    if deltatime < 300:
        print('from cache power')
        league_data = cache[sport]['14daypowerrankings']['data']
    else:
        print('fetching it power')
        league_data = fetch_ratings(sport)
        cache[sport]['14daypowerrankings']['data'] = league_data
        cache[sport]['14daypowerrankings']['timestamp'] = now
    
    team_ratings = {}
    relevant_games = []
    eastern = ZoneInfo("America/New_York")
    now = datetime.now(eastern)
    games = league_data['games']

    for key, value in league_data['all'].items():
        team_ratings[key] = {"rating": value['elo'], "name": key}

    for key, value in league_data['games'].items():
        game_timestamp = datetime.fromisoformat(value["date"]).astimezone(eastern)
        seven_days_ago = now - timedelta(days=14)
        
        if seven_days_ago <= game_timestamp <= now:
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



def thirty_day_powerrankings(sport):
    if sport == "MLBbaseball":
        K_mult = 64
    elif sport == "NHLhockey":
        K_mult = 128
    elif sport == "NBAbasketball":
        K_mult = 32 


    now = int(datetime.now().timestamp())
    deltatime = abs(int(cache[sport]['30daypowerrankings']['timestamp'])-now)

    if deltatime < 300:
        print('from cache power')
        league_data = cache[sport]['30daypowerrankings']['data']
    else:
        print('fetching it power')
        league_data = fetch_ratings(sport)
        cache[sport]['30daypowerrankings']['data'] = league_data
        cache[sport]['30daypowerrankings']['timestamp'] = now
    
    team_ratings = {}
    relevant_games = []
    eastern = ZoneInfo("America/New_York")
    now = datetime.now(eastern)
    games = league_data['games']

    for key, value in league_data['all'].items():
        team_ratings[key] = {"rating": value['elo'], "name": key}

    for key, value in league_data['games'].items():
        game_timestamp = datetime.fromisoformat(value["date"]).astimezone(eastern)
        seven_days_ago = now - timedelta(days=30)
        
        if seven_days_ago <= game_timestamp <= now:
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



def get_top_5(sport):
    teams = []
    for key, value in sport["all"].items():
        teams.append((key, value['elo']))


    return teams[:5]

@app.get("/")
def home():
    nba_top_5 = get_top_5(fetch_ratings("NBAbasketball"))
    mlb_top_5 = get_top_5(fetch_ratings("MLBbaseball"))
    nhl_top_5 = get_top_5(fetch_ratings("NHLhockey"))

    ticker_info = fill_ticker()

    return render_template("index.html", nba=nba_top_5, nhl=nhl_top_5, mlb=mlb_top_5, ticker=ticker_info)

@app.get("/basketball/ratings")
def nba_ratings():
    nba_ratings = fetch_ratings("NBAbasketball")
    return render_template("basketball_ratings.html", nba=nba_ratings)



@app.get("/basketball")
def basketball_home():
    nba_top_5 = get_top_5(fetch_ratings("NBAbasketball"))
    nba_powerrankings = seven_day_powerrankings("NBAbasketball")

    return render_template("basketball_index.html", ratings=nba_top_5, powerranking=nba_powerrankings)

@app.get("/basketball/powerrankings")
def nba_powerrankings():
    nba_powerrankings7day = seven_day_powerrankings("NBAbasketball")
    nba_powerrankings14day = fourteen_day_powerrankings("NBAbasketball")
    nba_powerrankings30day = thirty_day_powerrankings("NBAbasketball")

    return render_template("basketball_powerrankings.html", sevenday=nba_powerrankings7day, fourteenday=nba_powerrankings14day, thirtyday=nba_powerrankings30day)


@app.get("/basketball/team")
def display_team_data():
    team = request.args.get("team")
    data = fetch_ratings("NBAbasketball")
    game_ids = data['all'][team]['games']
    games = data['games']
    team_record = data['all'][team]['record']
    table_data = []
    print(len(game_ids), "num games")
    for id in game_ids:
        current_game = games[id]
        date = current_game["date"]
        title_prefix = ""
        opponent = ""
        score = ""
        result = ""
        if current_game['team_1']['team_name'] == team:
            #the game is at home
            title_prefix = "vs. "
            opponent = title_prefix + current_game['team_2']['team_name']
            score = f"{current_game["team_1"]['score']}-{current_game["team_2"]['score']}"

            if current_game['team_1']['winner'] == True:
                result = 'W'
            else:
                result = 'L'

            delta_elo = current_game['team_1']['delta_elo']

        else:
            title_prefix = "@ "
            opponent = title_prefix + current_game['team_1']['team_name']
            score = f"{current_game["team_2"]['score']}-{current_game["team_1"]['score']}"

            if current_game['team_2']['winner'] == True:
                result = 'W'
            else:
                result = 'L'

            delta_elo = current_game['team_2']['delta_elo']

        table_data.append([date, opponent, score, result, delta_elo])
    table_data.reverse()
    print(len(table_data))
    return render_template("basketball_team_info.html", table_data=table_data, team_name=team, record=team_record)

            
        
        


@app.get("/<sport>/divisions")
def filter_divisions(sport):
    division = request.args.get("division")
    teams = fetch_ratings(sport)

    if division == "all":
        division_teams = teams['all']
    elif division == "Eastern":
        division_teams = teams['Eastern']
    elif division == "Western":
        division_teams = teams['Western']
    else:
        division_teams = teams['all']

    sorted_teams = sorted(
        division_teams.items(),
        key=lambda x: x[1]['elo'], 
        reverse=True
    )
    return jsonify(sorted_teams)


@app.get("/<sport>/powerrankingsdata")
def pr_data(sport):
    sevenday = seven_day_powerrankings(sport)
    fourteenday = fourteen_day_powerrankings(sport)
    thirtyday = thirty_day_powerrankings(sport)

    teams={
        "7day":sevenday,
        "14day": fourteenday,
        "30day": thirtyday
    }


    return jsonify(teams)


if __name__ == "__main__":
    app.run(debug=True)


