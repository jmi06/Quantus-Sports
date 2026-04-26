import pandas as pd
import networkx as nx
import numpy as np
from networkx.readwrite import json_graph

def get_graph_file(sport, league_data):
    winning_teams = []
    losing_teams = []
    point_diffs = []    
    timestamps = []

    for key, value in league_data['games'].items():
        if value['team_1']['winner'] == True:
            winning_teams.append(value['team_1']['team_name'])
            losing_teams.append(value['team_2']['team_name'])
        else:
            losing_teams.append(value['team_1']['team_name'])
            winning_teams.append(value['team_2']['team_name'])
        point_diffs.append(value['points_diff'])
        timestamps.append(value['date'])


    data={
        "winner": winning_teams,
        "loser": losing_teams,
        "pointDiff": point_diffs,
        "timestamp": timestamps
    }

    df = pd.DataFrame(data)


    G = nx.DiGraph()

    for row in df.itertuples(index=False):
        weight = 1
        if G.has_edge(row.loser, row.winner):
            G[row.loser][row.winner]['weight'] += weight
        else:
            G.add_edge(row.loser, row.winner, weight=weight)

    scores = nx.pagerank(G, alpha=0.85, weight='weight')
    return json_graph.node_link_data(G)

def pagerank(sport, league_data):
    winning_teams = []
    losing_teams = []
    point_diffs = []    
    timestamps = []

    for key, value in league_data['games'].items():
        if value['team_1']['winner'] == True:
            winning_teams.append(value['team_1']['team_name'])
            losing_teams.append(value['team_2']['team_name'])
        else:
            losing_teams.append(value['team_1']['team_name'])
            winning_teams.append(value['team_2']['team_name'])
        point_diffs.append(value['points_diff'])
        timestamps.append(value['date'])


    data={
        "winner": winning_teams,
        "loser": losing_teams,
        "pointDiff": point_diffs,
        "timestamp": timestamps
    }

    df = pd.DataFrame(data)


    G = nx.DiGraph()

    for row in df.itertuples(index=False):
        weight = 1
        if G.has_edge(row.loser, row.winner):
            G[row.loser][row.winner]['weight'] += weight
        else:
            G.add_edge(row.loser, row.winner, weight=weight)

    scores = nx.pagerank(G, alpha=0.85, weight='weight')
    results_df = pd.DataFrame(list(scores.items()), columns=['Team', 'PR_Score'])
    average = results_df['PR_Score'].mean()

    results_df['index_score'] = 100*(results_df['PR_Score']/average)

    results_dict =  results_df.sort_values('index_score', ascending=False, ignore_index=True).to_dict(orient='records')

    # Key is the divison name, value is the teams in the division
    for key, value in league_data.items():
        for i in results_dict:
            if i["Team"] in value:
                value[i["Team"]]["index_score"] = i["index_score"]             
            
    return league_data


