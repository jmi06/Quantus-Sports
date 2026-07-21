from datetime import date, datetime, timedelta
import requests

from app.cache import cache
from app.config import CORE_CONFIG


def fetch_upcoming(sport):
    today_str = date.today().strftime("%Y%m%d")
    future_date = date.today() + timedelta(days=3)
    future_str = future_date.strftime("%Y%m%d")
    url= f"https://site.api.espn.com/apis/site/v2/sports/{CORE_CONFIG[sport]['espn_sport']}/{CORE_CONFIG[sport]['espn_league']}/scoreboard?dates={today_str}-{future_str}"


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
