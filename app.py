from flask import Flask, render_template, request, jsonify
import os
import pytz
import requests
import time
import math
from datetime import timezone, datetime, timedelta, date
from zoneinfo import ZoneInfo
from pagerank import pagerank, get_graph_file


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
        "upcoming":{
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
        "upcoming":{
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
        "upcoming":{
            "data":{},
            "timestamp":0,
        },


        "timestamp":0
    },


}

SPORTS_CONFIG = {
    "NBAbasketball": {
        "internal_id": "NBAbasketball",
        "worker_url": "https://dark-mountain-23d8.jmi06.workers.dev/",
        "espn_sport": "basketball",
        "espn_league": "nba",
        "k_mult": 32,
        "template_dir": "NBAbasketball",
        "division_titles": ["All", "Eastern", "Western"],
        "divisions": ["all", "Eastern", "Western"]

    },
    "NHLhockey": {
        "internal_id": "NHLhockey",
        "worker_url": "https://shy-recipe-1436.jmi06.workers.dev/",
        "espn_sport": "hockey",
        "espn_league": "nhl",
        "k_mult": 128,
        "template_dir": "NHLhockey",
        "division_titles": ["All", "Eastern", "Western", "Eastern Atlantic", "Eastern Metropolitan", "Western Pacific", "Western Central"],
        "divisions": ["all", "Eastern", "Western", "Eastern Atlantic", "Eastern Metropolitan", "Western Pacific", "Western Central"]
    },
    "MLBbaseball": {
        "internal_id": "MLBbaseball",
        "worker_url": "https://falling-frog-ec91.jmi06.workers.dev/",
        "espn_sport": "baseball",
        "espn_league": "mlb",
        "k_mult": 64,
        "template_dir": "MLBbaseball",
        "division_titles": ["All", "AL", "NL", "AL East", "AL Central", "AL West" , "NL East", "NL Central", "NL West"],
        "divisions": ["all", "AL", "NL", "ALEast", "ALCentral", "ALWest" , "NL East", "NL Central", "NL West"]

    }
}


def fetch_ratings(sport):
    url= SPORTS_CONFIG[sport]['worker_url']
    now = int(datetime.now().timestamp())
    deltatime = abs(int(cache[sport]['rankings']['timestamp'])-now)

    if deltatime < 300:
        print('from cache')
        return cache[sport]['rankings']['data']
    else:
        print('fetching it')
        response = requests.get(url)
        with_pagerank = pagerank(sport, response.json())
        cache[sport]['rankings']['data'] = with_pagerank
        cache[sport]['rankings']['timestamp'] = now
        return with_pagerank

def fetch_upcoming(sport):
    today_str = date.today().strftime("%Y%m%d")
    future_date = date.today() + timedelta(days=3)
    future_str = future_date.strftime("%Y%m%d")
    url= f"https://site.api.espn.com/apis/site/v2/sports/{SPORTS_CONFIG[sport]['espn_sport']}/{SPORTS_CONFIG[sport]['espn_league']}/scoreboard?dates={today_str}-{future_str}"


    now = int(datetime.now().timestamp())
    deltatime = abs(int(cache[sport]['upcoming']['timestamp'])-now)

    if deltatime < 300:
        print('from cache')
        return cache[sport]['upcoming']['data']
    else:
        print('fetching it')
        response = requests.get(url)
        cache[sport]['upcoming']['data'] = response.json()
        cache[sport]['upcoming']['timestamp'] = now
        return response.json()


def powerrankings(sport, days_back):
    # if sport == "MLBbaseball":
    #     K_mult = 64
    # elif sport == "NHLhockey":
    #     K_mult = 128
    # elif sport == "NBAbasketball":
    #     K_mult = 32 

    K_mult= SPORTS_CONFIG[sport]['k_mult']

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

    return render_template("index.html", nba=nba_top_5, nhl=nhl_top_5, mlb=mlb_top_5)

@app.get("/sitemap")
def sitemap():
    return render_template("sitemap.html")

@app.get("/ratings")
def ratings_home():
    nba_top_5 = get_top_5(fetch_ratings("NBAbasketball"))
    mlb_top_5 = get_top_5(fetch_ratings("MLBbaseball"))
    nhl_top_5 = get_top_5(fetch_ratings("NHLhockey"))

    return render_template("ratings.html", nba=nba_top_5, nhl=nhl_top_5, mlb=mlb_top_5)


@app.get("/<sport_key>/ratings")
def league_ratings(sport_key):

    if sport_key not in SPORTS_CONFIG:
        return "Sport not found", 404   
    return render_template(f"{sport_key}/ratings_select.html", sport_key=sport_key)

@app.get("/<sport_key>/ratings/QuantusRatings")
def league_quantus_ratings(sport_key):
    if sport_key not in SPORTS_CONFIG:
        return "Sport not found", 404   
    ratings = fetch_ratings(sport_key)
    return render_template(f"ratings_elo.html", sport_name=SPORTS_CONFIG[sport_key]['espn_sport'].capitalize(), divisions=SPORTS_CONFIG[sport_key]['divisions'], division_titles=SPORTS_CONFIG[sport_key]['division_titles'], league=ratings,sport_key=sport_key)

@app.get("/<sport_key>/ratings/QuantusIndex")
def league_quantus_graph(sport_key):
    if sport_key not in SPORTS_CONFIG:
        return "Sport not found", 404   
    ratings = fetch_ratings(sport_key)
    # pagerank = pagerank("NBAbasketball", nba_ratings['games'])
    return render_template(f"ratings_graph.html",sport_key=sport_key, divisions=SPORTS_CONFIG[sport_key]['divisions'], division_titles=SPORTS_CONFIG[sport_key]['division_titles'])

# @app.get("/<sport_key>/ratings/graph")
# def explore_graph(sport_key):
#     ratings = fetch_ratings(sport_key)
#     graph_file = get_graph_file(sport_key, ratings)
#     return render_template(f"graph.html", sport_key=sport_key, graph=graph_file)

@app.get("/<sport_key>")
def sport_home(sport_key):
    if sport_key not in SPORTS_CONFIG:
        return "Sport not found", 404   
    top_5 = get_top_5(fetch_ratings(sport_key))
    league_powerrankings = powerrankings(sport_key, 7)

    return render_template(f"{sport_key}/home.html",sport_key=sport_key, ratings=top_5, powerranking=league_powerrankings)

@app.get("/about")
def about():
    return render_template("about.html")

@app.get("/<sport_key>/powerrankings")
def league_powerrankings(sport_key):
    if sport_key not in SPORTS_CONFIG:
        return "Sport not found", 404   
    powerrankings7day = powerrankings(sport_key, 7)
    powerrankings14day = powerrankings(sport_key, 14)
    powerrankings30day = powerrankings(sport_key, 30)

    return render_template(f"powerrankings.html", sport_key=sport_key, sevenday=powerrankings7day, fourteenday=powerrankings14day, thirtyday=powerrankings30day)

@app.get("/<sport_key>/predictions")
def league_predictions(sport_key):
    if sport_key not in SPORTS_CONFIG:
        return "Sport not found", 404 
      
    upcoming_games = fetch_upcoming(sport_key)
    current_rankings = fetch_ratings(sport_key)
    pred_data = []

    for game in upcoming_games['events']:
        match_date = game['date']
        utc_time = datetime.fromisoformat(match_date.replace('Z', '+00:00'))
        user_timezone = request.args.get('timezone', 'UTC')

        try:
            user_tz = pytz.timezone(user_timezone)
            local_time = utc_time.astimezone(user_tz)
            time_of_day = local_time.strftime("%B %-d %Y %-I:%M%p") # e.g., "10:35 PM"
        except:
            local_time = utc_time.astimezone("America/Boston")
            time_of_day = local_time.strftime("%B %-d %Y %-I:%M%p")  # e.g., "10:35 PM"

        home_team_fullname = game["competitions"][0]["competitors"][0]["team"]["displayName"]
        home_team_name = game["competitions"][0]["competitors"][0]["team"]["shortDisplayName"]
        home_team_rating = current_rankings['all'][home_team_fullname]['elo']
        home_team_placement = list(current_rankings['all'].keys()).index(home_team_fullname)

        away_team_fullname = game["competitions"][0]["competitors"][1]["team"]["displayName"]
        away_team_name = game["competitions"][0]["competitors"][1]["team"]["shortDisplayName"]
        away_team_rating = current_rankings['all'][away_team_fullname]['elo']
        away_team_placement = list(current_rankings['all'].keys()).index(away_team_fullname)
        
        
        home_team_winprob = f"{int(round(1.0 / (1 + math.pow(10, (away_team_rating - home_team_rating) / 400.0)),2)*100)}%"
        away_team_winprob = f"{int(round(1.0 / (1 + math.pow(10, (home_team_rating - away_team_rating) / 400.0)),2)*100)}%"

        accuracy = current_rankings['predictionAccuracy']['acc'].split('-')
        print(accuracy, 'acc')
        accuracy_record = round(int(accuracy[0])/(int(accuracy[0])+int(accuracy[1])),3)
        match_data = [time_of_day, home_team_name, home_team_rating, home_team_placement, home_team_winprob, away_team_name, away_team_rating, away_team_placement, away_team_winprob]
        pred_data.append(match_data)
    return render_template(f"predictions.html", match_data=pred_data, sport_key=sport_key, accuracy=current_rankings['predictionAccuracy'], accuracy_record=accuracy_record)





@app.get("/<sport_key>/team")
def display_team_data(sport_key):
    if sport_key not in SPORTS_CONFIG:
        return "Sport not found", 404   
    team = request.args.get("team")
    data = fetch_ratings(sport_key)
    game_ids = data['all'][team]['games']
    games = data['games']
    team_record = data['all'][team]['record']
    table_data = []
    ratings = []
    dates = []
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
            elo = current_game['team_1']["elo_after"]
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
            elo = current_game['team_2']["elo_after"]


        table_data.append([date, opponent, score, result, delta_elo])
        dates.append(date)
        ratings.append(elo)
    table_data.reverse()
    dates.reverse()
    ratings.reverse()
    print(len(table_data))
    return render_template(f"team_info.html",sport_key=sport_key, table_data=table_data, team_name=team, record=team_record, ratings=ratings, dates=dates)

            
        
        


@app.get("/<sport>/divisions")
def filter_divisions(sport):

    division = request.args.get("division")
    teams = fetch_ratings(sport)


    division_teams = teams[division]

    sorted_teams = sorted(
        division_teams.items(),
        key=lambda x: x[1]['elo'], 
        reverse=True
    )
    return jsonify(sorted_teams)


@app.get("/<sport>/powerrankingsdata")
def pr_data(sport):
    sevenday = powerrankings(sport, 7)
    fourteenday = powerrankings(sport, 14)
    thirtyday = powerrankings(sport, 30)

    teams={
        "7day":sevenday,
        "14day": fourteenday,
        "30day": thirtyday
    }


    return jsonify(teams)



if __name__ == "__main__":
    app.run(debug=True)


