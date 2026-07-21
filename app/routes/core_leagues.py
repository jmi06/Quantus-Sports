import math
import pytz
from datetime import datetime
from flask import Flask, render_template, request, jsonify, Blueprint, abort


from app.config import CORE_CONFIG
from app.utils.core.ratings import *
from app.utils.core.powerrankings import *  
from app.utils.core.upcoming import *

# Define the blueprint for core sports.
core_sport_blueprint = Blueprint('core_sports', __name__)

# Core sports are only those that are in the CORE_CONFIG.
@core_sport_blueprint.url_value_preprocessor
def validate_core_sport(url, values):
    if values and 'sport_key' in values:
        if values['sport_key'] not in CORE_CONFIG:
            abort(404, description="Sport not found")

# Home page for the league
@core_sport_blueprint.get("/<sport_key>")
def sport_home(sport_key):
    top_5 = get_top_5(fetch_ratings(sport_key))
    league_powerrankings = powerrankings(sport_key, 7)

    return render_template(f"{sport_key}/home.html",sport_key=sport_key, ratings=top_5, powerranking=league_powerrankings)


@core_sport_blueprint.get("/<sport_key>/ratings")
def league_ratings(sport_key):
    return render_template(f"{sport_key}/ratings_select.html", sport_key=sport_key)

@core_sport_blueprint.get("/<sport_key>/ratings/QuantusRatings")
def league_quantus_ratings(sport_key):
    ratings = fetch_ratings(sport_key)
    return render_template(f"core/ratings_elo.html", sport_name=CORE_CONFIG[sport_key]['espn_sport'].capitalize(), divisions=CORE_CONFIG[sport_key]['divisions'], division_titles=CORE_CONFIG[sport_key]['division_titles'], league=ratings,sport_key=sport_key)

@core_sport_blueprint.get("/<sport_key>/ratings/QuantusIndex")
def league_quantus_graph(sport_key):
    ratings = fetch_ratings(sport_key)
    return render_template(f"core/ratings_graph.html",sport_key=sport_key, divisions=CORE_CONFIG[sport_key]['divisions'], division_titles=CORE_CONFIG[sport_key]['division_titles'])

@core_sport_blueprint.get("/<sport_key>/powerrankings")
def league_powerrankings(sport_key):
    powerrankings7day = powerrankings(sport_key, 7)
    powerrankings14day = powerrankings(sport_key, 14)
    powerrankings30day = powerrankings(sport_key, 30)

    return render_template(f"core/powerrankings.html", sport_key=sport_key, sevenday=powerrankings7day, fourteenday=powerrankings14day, thirtyday=powerrankings30day)

@core_sport_blueprint.get("/<sport_key>/predictions")
def league_predictions(sport_key):
    upcoming_games = fetch_upcoming(sport_key)
    current_rankings = fetch_ratings(sport_key)
    pred_data = [] #Holds match data

    # Assemble the predictions.
    for game in upcoming_games['events']:
        match_date = game['date']

        utc_time = datetime.fromisoformat(match_date.replace('Z', '+00:00'))
        user_timezone = request.args.get('timezone', 'UTC') 

        # Attempt to use the users timezone, if we can't, use Eastern time.
        try:
            user_tz = pytz.timezone(user_timezone)
            local_time = utc_time.astimezone(user_tz)
            time_of_day = local_time.strftime("%B %-d %Y %-I:%M%p")
        except:
            local_time = utc_time.astimezone("America/Boston")
            time_of_day = local_time.strftime("%B %-d %Y %-I:%M%p") 

        # Data for the home team that we wil need later on
        home_team_fullname = game["competitions"][0]["competitors"][0]["team"]["displayName"]
        home_team_name = game["competitions"][0]["competitors"][0]["team"]["shortDisplayName"]
        home_team_rating = current_rankings['all'][home_team_fullname]['elo']
        home_team_placement = list(current_rankings['all'].keys()).index(home_team_fullname)

        # Data for the away team that we wil need later on
        away_team_fullname = game["competitions"][0]["competitors"][1]["team"]["displayName"]
        away_team_name = game["competitions"][0]["competitors"][1]["team"]["shortDisplayName"]
        away_team_rating = current_rankings['all'][away_team_fullname]['elo']
        away_team_placement = list(current_rankings['all'].keys()).index(away_team_fullname)
        
        # Away and home win probabilities (according to Elo formula)
        home_team_winprob = f"{int(round(1.0 / (1 + math.pow(10, (away_team_rating - home_team_rating) / 400.0)),2)*100)}%"
        away_team_winprob = f"{int(round(1.0 / (1 + math.pow(10, (home_team_rating - away_team_rating) / 400.0)),2)*100)}%"


        # Add to our list of matches
        match_data = [time_of_day, home_team_name, home_team_rating, home_team_placement, home_team_winprob, away_team_name, away_team_rating, away_team_placement, away_team_winprob]
        pred_data.append(match_data)

    # Parse and calculate accuracy
    accuracy = current_rankings['predictionAccuracy']['acc'].split('-')
    accuracy_record = round(int(accuracy[0])/(int(accuracy[0])+int(accuracy[1])),3)
    
    return render_template(f"core/predictions.html", match_data=pred_data, sport_key=sport_key, accuracy=current_rankings['predictionAccuracy'], accuracy_record=accuracy_record)

# Displays graph and summary of team's performance
@core_sport_blueprint.get("/<sport_key>/team")
def display_team_data(sport_key):
    
    team = request.args.get("team") # Team in the address arguments
    data = fetch_ratings(sport_key) 
    game_ids = data['all'][team]['games'] # A list of the team's game ID's
    games = data['games']
    team_record = data['all'][team]['record']

    table_data = []
    ratings = []
    dates = []

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
    return render_template(f"core/team_info.html",sport_key=sport_key, table_data=table_data, team_name=team, record=team_record, ratings=ratings, dates=dates)

@core_sport_blueprint.get("/<sport>/divisions")
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


@core_sport_blueprint.get("/<sport>/powerrankingsdata")
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