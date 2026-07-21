# Endpoints, values, and configuration information for core sports
CORE_CONFIG = {
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