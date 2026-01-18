document.getElementById('date-range').value = "7"

const config = {
  "NBAbasketball": {
        "url": "https://dark-mountain-23d8.jmi06.workers.dev/",
        "league": "NBA",
        "sport": "basketball",
        "color": "#e7bba7",
        "divisions": { "All Teams": "all", "Eastern": "Eastern", "Western": "Western" },
        "K": 32

    },

    "NHLhockey": {
        "url": "https://shy-recipe-1436.jmi06.workers.dev/",
        "league": "NHL",
        "sport": "hockey",
        "color": "#c5a7e7",
        
        "divisions": { "All Teams": "all", "Eastern": "Eastern", "Eastern Atlantic": "Eastern Atlantic", "Eastern Metro": "Eastern Metropolitan", "Western": "Western", "Western Central": "Western Central", "Western Pacific": "Western Pacific" },
        "K": 128

    },

    "MLBbaseball": {
        "url": "https://falling-frog-ec91.jmi06.workers.dev",
        "league": "MLB",
        "sport": "baseball",
        "color": "#a7e7b1",
        "K": 64,
        
        "divisions": { "All Teams": "all", "AL": "AL", "AL East": "ALEast", "AL Central": "ALCentral", "AL West": "ALWest", "NL": "NL", "NL East": "NL East", "NL Central": "NL Central", "NL West": "NL West" }


    }
}

function getTeams(division, sport) {
    fetch(config[sport]['url'])
        .then(response => {
            if (!response.ok) {
                throw new Error('Response was not ok')

            }
            return response.json();
        })

        .then(data => {


            
            getLastXDays(data, sport)



        })

        .catch(error => {
            console.error('Error: ', error)
        })

}



function getLastXDays(data, sport){

    const days = document.getElementById("date-range").value
    const relevantGames = []
    const today = new Date
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const ranges = {
        "7": 604800000,
        "14": 604800000 * 2,
        "30": 2592000000
    };
    

    console.log(data)

    Object.entries(data['games']).forEach((game, info)=>{


        const gameTime = new Date(game[1].date).getTime()
        if((todayTimestamp - gameTime) < ranges[days]){
            relevantGames.push(game)
        }
        
    });

    console.log(relevantGames)

    console.log(data['games'])
    const teams = data['all']
    Object.entries(teams).forEach((team, info)=>{
        team[1]['elo'] = 1000
        team[1]['games'] = []
    })

    relevantGames.forEach((game)=>{
        const team1 = game[1]['team_1']
        const team2 = game[1]['team_2']

        const team1elo = teams[game[1]['team_1']['team_name']]['elo']
        const team2elo = teams[game[1]['team_2']['team_name']]['elo']


        const team1winprob = 1/(1+10**((team2elo-team1elo)/400))
        const team2winprob = 1/(1+10**((team1elo-team2elo)/400))

        const K = config[sport]['K'] * (game[1]['points_diff']**0.5)
        let team1W = 0
        let team2W = 0

        if(team1['winner'] == false){
            team1W = 0
            team2W = 1
        } else{
            team1W = 1
            team2W = 0
        }

        teams[team1['team_name']]['elo'] = team1elo + K *(team1W-team1winprob)
        teams[team2['team_name']]['elo'] = team2elo + K *(team2W-team2winprob)


        teams[team1['team_name']]['games'].push(game[0]) 
        teams[team2['team_name']]['games'].push(game[0]) 

        const team1delta = teams[team1['team_name']]['elo'] - team1elo
        const team2delta = teams[team2['team_name']]['elo'] - team2elo

        team1['delta_elo'] = team1delta > 0 ? "+" + team1delta.toFixed(2) : team1delta.toFixed(2).toString();
        team2['delta_elo'] = team2delta > 0 ? "+" + team2delta.toFixed(2) : team2delta.toFixed(2).toString();


    })
    console.log(teams)
    const newData = {
        teams: teams,
        games: data['games']
    }


    generate_table(sport, newData)

}







function generate_table(sport, data) {

    const orderData = Object.entries(data['teams']).sort(([, a], [, b]) => b.elo - a.elo);
    const ranking = []
    document.getElementById("options").innerHTML = ''
    const list = document.createElement('ul')
    const divisions = Object.keys(config[sport]['divisions'])

    console.log(data)


    document.getElementById("options").append(list)


    Object.keys(data).forEach((teamname) => {
        ranking.push(teamname);
    });


    document.getElementById('rank-table').innerHTML = `
    

        <table id='data-table'>
            <thead>
                <tr id='table-head'>
                <th>Pos</th>
                <th>Team</th>
                <th>Rating</th>
               </tr>
          </thead>
                <tbody id="table-body">
            </tbody>
        </table>
    `
        ;

    const Pos = Array.from({ length: Object.keys(orderData).length }, (_, i) => i + 1);
    const Team = []
    const Rating = []
    const Games = []
    const Record = []



    Object.keys(orderData).forEach((team) => {
        currentTeam = orderData[team]
        Team.push(currentTeam[0])

        Rating.push(currentTeam[1]['elo'].toFixed(2))
        Games.push(currentTeam[1]['games'].length)
        if (sport == "NHLhockey") {
            let record_formatted = currentTeam[1]['record'].split('-')

            const wins = Number(record_formatted[0])
            const losses = Number(record_formatted[1])
            const otl = Number(record_formatted[2])
            record_formatted = wins / (wins + losses + otl)
        } else {
            let record_formatted = currentTeam[1]['record'].split('-')
            const wins = Number(record_formatted[0])
            const losses = Number(record_formatted[1])

            record_formatted = wins / (wins + losses)
            Record.push(record_formatted)
        }


    })


    for (let i = 0; i < Team.length; i++) {
        const tr = document.createElement('tr')


        tr.innerHTML = `
        <td>${Pos[i]}</td>
        <td class="team_option" id="${Team[i]}">${Team[i]}</td>
        <td>${Rating[i]}</td>
    `;

    
    document.getElementById('table-body').append(tr)

    document.getElementById(Team[i]).onclick = function(){
          displayTeamData(Team[i], data, sport)

    }


    }


}







function displayTeamData(team_name, data, sport) {
    const ranking = []
    Object.keys(data).forEach((teamname) => {
        ranking.push(teamname);
    });


    document.getElementById('options').innerHTML = ""
    document.getElementById('rank-table').innerHTML = ""

    const container = document.createElement('div')
    container.id = 'sub-container'
    container.classList.add('sub-container')

    container.innerHTML = `
    
    <h3 style="margin: 2%; color:white;" onclick=""><a href =""style="color:white;"><-- Back</a></h3>
    <h2 style="color: ${config[sport]['color']}; margin: 2%;">${team_name}</h2>


    <div id="rank-table">
        <table id='data-table' style='width: 90%'>
            <thead>
                <tr id='table-head'>
                <th>Date</th>
                <th>Opponent</th>
                <th>Score</th>
                <th>Result</th>

                <th>Delta</th>
               </tr>
          </thead>
                <tbody id="table-body">
            </tbody>
        </table>
    
    
    </div>
    
    `
        ;

    console.log(team_name)

    const gamesPlayed = data['teams'][team_name]['games']
    const dates = []
    const opponents = []
    const scores = []
    const delta = []
    const rating = []
    const won = []


    console.log(data['games'])
    gamesPlayed.forEach((game) => {
        currentGame = data['games'][game]

        dates.push(currentGame['date'])

        if (currentGame['team_1']['team_name'] == team_name) {
            opponents.push(currentGame['team_2']['team_name'])
        } else {
            opponents.push(currentGame['team_1']['team_name'])
        }


        if (currentGame['team_1']['team_name'] == team_name) {
            scores.push(`${currentGame['team_1']['score']}-${currentGame['team_2']['score']}`)
        } else {
            scores.push(`${currentGame['team_2']['score']}-${currentGame['team_1']['score']}`)
        }


        if (currentGame['team_1']['team_name'] == team_name) {
            delta.push(currentGame['team_1']['delta_elo'])
        } else {
            delta.push(currentGame['team_2']['delta_elo'])
        }


        if (currentGame['team_1']['team_name'] == team_name) {
            won.push(currentGame['team_1']['winner'])
        } else {
            won.push(currentGame['team_2']['winner'])
        }

        if (currentGame['team_1']['team_name'] == team_name) {
            rating.push(currentGame['team_1']['elo_after'])
        } else {
            rating.push(currentGame['team_2']['elo_after'])
        }


    })

    scores.reverse()
    dates.reverse()
    opponents.reverse()
    delta.reverse()
    won.reverse()
    rating.reverse()

    document.getElementById('footer').before(container)

    for (let i = 0; i < dates.length; i++) {
        const tr = document.createElement('tr')
        let resultClass = '';
        let resultText = '';

        if (won[i] === true) {
            resultClass = 'green';
            resultText = 'W';
        } else {
            resultClass = 'red';
            resultText = 'L';
        }



        tr.innerHTML = `
        <td>${dates[i]}</td>
        <td>vs. ${opponents[i]}</td>
        <td>${scores[i]}</td>
        <td class="${resultClass}">${resultText}</td>
        <td class="${resultClass}">${delta[i]}</td>
    `;


        document.getElementById('table-body').append(tr)

    }


}


