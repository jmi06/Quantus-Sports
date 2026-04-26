const colors = {
    "NBAbasketball": {
        "Hawks": "#FF6161",
        "Celtics": "#a7e7b1",
        "Nets": "#C9C9C9",
        "Hornets": "#8ea2fd",
        "Bulls": "#FF6161",
        "Cavaliers": "#8ea2fd",
        "Mavericks": "#8ea2fd",
        "Nuggets": "#8EC7FD",
        "Pistons": "#FF6161",
        "Warriors": "#FFF88F",
        "Rockets": "#FF6161",
        "Pacers": "#8ea2fd",
        "Clippers": "#FF6161",
        "Lakers": "#bd8fff",
        "Grizzlies": "#8ea2fd",
        "Heat": "#FF6161",
        "Bucks": "#a7e7b1",
        "Timberwolves": "#8ea2fd",
        "Pelicans": "#8ea2fd",
        "Knicks": "#ffb28f",
        "Thunder": "#8ea2fd",
        "Magic": "#8ea2fd",
        "76ers": "#FF6161",
        "Suns": "#bd8fff",
        "Trail Blazers": "#FF6161",
        "Kings": "#bd8fff",
        "Spurs": "#C9C9C9",
        "Raptors": "#FF6161",
        "Jazz": "#8ea2fd",
        "Wizards": "#8ea2fd"
    },
    "MLBbaseball":{
        "Diamondbacks": "#FF6161",
        "Braves": "#8ea2fd",
        "Orioles": "#ffb28f",
        "Red Sox": "#FF6161",
        "Cubs": "#8EC7FD",
        "White Sox": "#C9C9C9",
        "Reds": "#FF6161",
        "Guardians": "#8ea2fd",
        "Rockies": "#bd8fff",
        "Tigers": "#8ea2fd",
        "Astros": "#8ea2fd",
        "Royals": "#8EC7FD",
        "Angels": "#FF6161",
        "Dodgers": "#8ea2fd",
        "Marlins": "#8ea2fd",
        "Brewers": "#8ea2fd",
        "Twins": "#8ea2fd",
        "Mets": "#8ea2fd",
        "Yankees": "#8ea2fd",
        "Athletics": "#a7e7b1",
        "Phillies": "#FF6161",
        "Pirates": "#C9C9C9",
        "Padres": "#FFF88F",
        "Giants": "#C9C9C9",
        "Mariners": "#8ea2fd",
        "Cardinals": "#FF6161",
        "Rays": "#8ea2fd",
        "Rangers": "#8ea2fd",
        "Blue Jays": "#8ea2fd",
        "Nationals": "#FF6161"
    }

}

function setup(sport){

    document.querySelectorAll("#hometeam").forEach((el)=>{
        for (const [key, value] of Object.entries(colors[sport])){
            if(el.innerText.includes(key)){
                el.style.color = colors[sport][key]

            }
        }
        
    })
    document.querySelectorAll("#awayteam").forEach((el)=>{
        for (const [key, value] of Object.entries(colors[sport])){
            if(el.innerText.includes(key)){
                el.style.color = colors[sport][key]

            }
        }        
    })

    document.querySelectorAll('.game').forEach((el)=>{
        const homeInfo = el.querySelector('#hometeam')
        const awayInfo = el.querySelector('#awayteam')
        const percentIndexHome = homeInfo.innerText.indexOf('%');
        const percentIndexAway = awayInfo.innerText.indexOf('%');

        const homePCT = parseInt(homeInfo.innerText.substring(percentIndexHome - 2, percentIndexHome))
        const awayPCT = parseInt(awayInfo.innerText.substring(percentIndexAway - 2, percentIndexAway))


        console.log(homePCT)
        if(homePCT > awayPCT){
            homeInfo.style.fontWeight = 'bold'
            homeInfo.style.textDecoration = 'underline'
        } else if(homePCT < awayPCT){
            awayInfo.style.fontWeight = 'bold'
            awayInfo.style.textDecoration = 'underline'
        }


    })



}