from flask import Blueprint, render_template

from app.utils.core.ratings import *

main_blueprint = Blueprint('main', __name__)

@main_blueprint.get("/")
def home():
    nba_top_5 = get_top_5(fetch_ratings("NBAbasketball"))
    mlb_top_5 = get_top_5(fetch_ratings("MLBbaseball"))
    nhl_top_5 = get_top_5(fetch_ratings("NHLhockey"))

    return render_template("main/index.html", nba=nba_top_5, nhl=nhl_top_5, mlb=mlb_top_5)


@main_blueprint.get("/about")
def about():
    return render_template("main/about.html")

@main_blueprint.get("/sitemap")
def sitemap():
    return render_template("main/sitemap.html")

@main_blueprint.get("/ratings")
def ratings_home():
    nba_top_5 = get_top_5(fetch_ratings("NBAbasketball"))
    mlb_top_5 = get_top_5(fetch_ratings("MLBbaseball"))
    nhl_top_5 = get_top_5(fetch_ratings("NHLhockey"))

    return render_template("main/ratings.html", nba=nba_top_5, nhl=nhl_top_5, mlb=mlb_top_5)
