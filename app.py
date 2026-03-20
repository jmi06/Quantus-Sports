from flask import Flask, render_template
import os
import requests


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
    if sport == "NHLHockey":
        url = "https://shy-recipe-1436.jmi06.workers.dev/"
    elif sport == "NBABasketball":
        url = "https://dark-mountain-23d8.jmi06.workers.dev/"
    elif sport == "MLBBaseball":
        url = "https://falling-frog-ec91.jmi06.workers.dev/"

    response = requests.get(url)
    return response.json()



def get_top_5(sport):
    teams = []
    for key, value in sport["all"].items():
        teams.append((key, value['elo']))


    return teams[:5]

@app.get("/")
def home():
    nba_top_5 = get_top_5(fetch_ratings("NBABasketball"))
    mlb_top_5 = get_top_5(fetch_ratings("MLBBaseball"))
    nhl_top_5 = get_top_5(fetch_ratings("NHLHockey"))

    ticker_info = fill_ticker()

    return render_template("index.html", nba=nba_top_5, nhl=nhl_top_5, mlb=mlb_top_5, ticker=ticker_info)

@app.get("/")
def nba_ratings():
    nba_ratings = fetch_ratings("NBABasketball")
    return render_template("index.html", nba=nba_top_5)


if __name__ == "__main__":
    app.run(debug=True)


