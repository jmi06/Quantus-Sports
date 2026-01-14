let highToLow;

let teamData = {}
let futureGames = {}


let pageSport;

const config = {

    "NBAbasketball": {
        "url": "https://dark-mountain-23d8.jmi06.workers.dev/",
        "league": "NBA",
        "sport": "basketball",
        "color": "#e7bba7",
        "divisions": { "All Teams": "all", "Eastern": "Eastern", "Western": "Western" },

    },

    "NHLhockey": {
        "url": "https://shy-recipe-1436.jmi06.workers.dev/",
        "league": "NHL",
        "sport": "hockey",
        "color": "#c5a7e7",
        
        "divisions": { "All Teams": "all", "Eastern": "Eastern", "Eastern Atlantic": "Eastern Atlantic", "Eastern Metro": "Eastern Metropolitan", "Western": "Western", "Western Central": "Western Central", "Western Pacific": "Western Pacific" }


    },

    "MLBbaseball": {
        "url": "https://falling-frog-ec91.jmi06.workers.dev",
        "league": "MLB",
        "sport": "baseball",
        "color": "#a7e7b1",
        
        "divisions": { "All Teams": "all", "AL": "AL", "AL East": "ALEast", "AL Central": "ALCentral", "AL West": "ALWest", "NL": "NL", "NL East": "NL East", "NL Central": "NL Central", "NL West": "NL West" }


    }



}




function generate_table(division, data) {
    let sport = pageSport

    orderData = data[division]
    const ranking = []
    document.getElementById("options").innerHTML = ''
    const list = document.createElement('ul')
    const divisions = Object.keys(config[sport]['divisions'])


    divisions.forEach((div) => {

        const li = document.createElement('li')
        li.innerHTML = `<a class="division-option" onclick='getDivision("${config[sport]['divisions'][div]}"); return false'>${div}</a>`
        list.appendChild(li)

    })

    document.getElementById("options").append(list)


    Object.keys(data['all']).forEach((teamname) => {
        ranking.push(teamname);
    });


    document.getElementById('rank-table').innerHTML = `
    

        <table id='data-table'>
            <thead>
                <tr id='table-head'>
                <th>Pos</th>
                <th>Team</th>
                <th>Rating</th>
                <th>Games</th>
                <th>Record</th>
               </tr>
          </thead>
                <tbody id="table-body">
            </tbody>
        </table>
    
    
    
    `
        ;

    const Pos = Array.from({ length: Object.keys(orderData).length }, (_, i) => i + 1);
    const Team = Object.keys(orderData)
    const Rating = []
    const Games = []
    const Record = []



    Object.keys(orderData).forEach((team) => {
        currentTeam = orderData[team]

        Rating.push(currentTeam['elo'])
        Games.push(currentTeam['record'].split('-').reduce((a, b) => a + +b, 0))
        if (pageSport == "NHLhockey") {
            let record_formatted = currentTeam['record'].split('-')

            const wins = Number(record_formatted[0])
            const losses = Number(record_formatted[1])
            const otl = Number(record_formatted[2])


            record_formatted = wins / (wins + losses + otl)
            Record.push(record_formatted)
        } else {
            let record_formatted = currentTeam['record'].split('-')
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
        <td>${Games[i]}</td>
        <td>${Record[i].toFixed(3)}</td>
    `;

    
    document.getElementById('table-body').append(tr)

    document.getElementById(Team[i]).onclick = function(){
          displayTeamData(Team[i], data, sport)

    }


    }


}









function formatGameTime(dateString) {
    const date = new Date(dateString);

    const day = date.getDate();
    const suffix = ["th", "st", "nd", "rd"][
        (day % 10 > 3 || [11, 12, 13].includes(day % 100)) ? 0 : day % 10
    ];

    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }); // "Saturday"
    const month = date.toLocaleDateString('en-US', { month: 'short' });   // "Oct"

    let time = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    time = time.toLowerCase().replace(" ", "");

    return `${weekday} ${month} ${day}${suffix} ${time}`;
}


function getDivision(division, sport) {

    if (sport) {
        pageSport = sport
    }

    if (!sport) {
        sport = pageSport
    }

    console.log(pageSport)


    fetch(config[sport]['url'])
        .then(response => {
            if (!response.ok) {
                throw new Error('Response was not ok')

            }
            return response.json();
        })

        .then(data => {
            generate_table(division, data)
        })

        .catch(error => {
            console.error('Error: ', error)
        })




}


function displayTeamData(team_name, data, sport) {
    const ranking = []
    Object.keys(data['all']).forEach((teamname) => {
        ranking.push(teamname);
    });


    document.getElementById('options').innerHTML = ""
    document.getElementById('rank-table').innerHTML = ""

    const container = document.createElement('div')
    container.id = 'sub-container'
    container.classList.add('sub-container')

    container.innerHTML = `
    
    <h3 style="margin: 2%; color:white;" onclick=""><a href =""style="color:white;"><-- Back</a></h3>
    <h2 style="color: ${config[sport]['color']}; margin: 2%;">#${ranking.indexOf(team_name) + 1} ${team_name} (${data['all'][team_name]['record']})</h2>

    <div style="width: 80%; height:50vh; margin:auto; margin-bottom: 1%">
    <canvas id="graph"></canvas>
    </div

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


    const gamesPlayed = data['all'][team_name]['games']


    const dates = []
    const opponents = []
    const scores = []
    const delta = []
    const rating = []
    const won = []



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



    console.log(rating)
    new Chart("graph", {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                pointRadius: 0,
                label: "Rating",
                data: rating,
                borderColor: config[sport]['color'],
                backgroundColor: config[sport]['color']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "white"
                    }
                }
            },
            scales: {
                x: {
                    reverse: true,
                    ticks: {
                        color: "white"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.2)"
                    }
                },
                y: {
                    ticks: {
                        color: "white"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.2)"
                    }
                }
            }
        }
    });


}











