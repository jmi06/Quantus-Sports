from datetime import datetime
import requests

from pagerank import pagerank
from app.config import CORE_CONFIG
from app.cache import cache


def fetch_ratings(sport):
    url= CORE_CONFIG[sport]['worker_url']
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
    
def get_top_5(sport):
    teams = []
    for key, value in sport["all"].items():
        teams.append((key, value['elo']))
    return teams[:5]