# QuantusSports

Unique sports statistics analytics platform.  

🌐 **Website:** https://quantussports.vercel.app

## About
QuantusSports is a sports statistics analytics platform providing unique metrics to competitive sports. The project evaluates team performance through various metrics such as   QuantusRatings, and the QuantusIndex. 


## Leagues:
- Major League Baseball
- National Hockey League
- National Basketball Association


## Rating
QuantusSports uses two ratings systems.

### QuantusRatings

QuantusRatings is a modified Elo formula. Every player starts with a rating of 1000. While the normal Elo formula treats a games results as a binary decision, win or loss, the QuantusRatings formula takes into account the point differential. If a hockey team is blown out 9-0, it will have a bigger impact on their rating than if they lose a close game.

### QuantusIndex

QuantusIndex is an application of Google's PageRank algorithm. QuantusIndex replaces web pages with sports teams. When a team beats another team, it not only rewards the team that won, but every other team in the network based on their past encounters. The league average QuantusIndex is normalized to 100, with teams above 100 being above average, and teams under 100 being below average.

## Features
- PowerRankings
- Predictions
- Team Analysis

## BlueSky
After each game, a bot posts the result, and impact on QuantusRating to the leagues respective BlueSky account.  
  
**MLB**: [QuantusBaseball.bsky.social](https://QuantusBaseball.bsky.social)  
**NHL**: [QuantusHockey.bsky.social](https://QuantusHockey.bsky.social)  
**NBA**: [QuantusBasketball.bsky.social](https://QuantusBasketball.bsky.social)  

## Installation
```bash
git clone https://github.com/jmi06/Quantus-Sports
cd Quantus-Sports

pip install -r requirements.txt
python3 run.py
```

*Data gathering scripts are available in [jmi06/Quantus-Sports-Scripts](https://github.com/jmi06/Quantus-Sports-Scripts)*