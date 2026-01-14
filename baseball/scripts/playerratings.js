let highToLow;

let teamData = {}
let futureGames = {}

document.getElementById("pos-select").value = "All";
document.getElementById("team-select").value = "All";
document.gete
let pageSport;

const config = {

    "MLBbaseball": {
        "url": "https://raw.githubusercontent.com/jmi06/PlayerRankings/refs/heads/master/",
        "league": "MLB",
        "sport": "baseball",
        "color": "#c5a7e7",
        "years": { "2024": "2024", "2025": "2025" }


    }

}


function generate_table(division, data, playerType, search='' ) {
    console.log(search)
    console.log(playerType)
    const positionsFilter = document.getElementById('pos-select').value
    const teamFilter = document.getElementById('team-select').value

    let sport = pageSport

    let orderData = data
    const ranking = []
    document.getElementById("options").innerHTML = ''
    const list = document.createElement('ul')
    const divisions = Object.keys(config[sport]['years']).reverse()


    divisions.forEach((div) => {

        const li = document.createElement('li')
        li.innerHTML = `<a class="division-option" onclick='getDivision("${config[sport]['years'][div]}"); return false'>${div}</a>`
        list.appendChild(li)

    })

    document.getElementById("options").append(list)
    document.getElementById("pos-select").onchange = function(){
        generate_table(division, data, playerType, search)
    }
    document.getElementById("team-select").onchange = function(){
        generate_table(division, data, playerType, search)
    }
    document.getElementById('qualified').onchange = function(){
        generate_table(division, data, playerType, search)
    }
    const playerTypeToggle = document.createElement('form')
    playerTypeToggle.classList.add("playerTypeToggle")
    playerTypeToggle.innerHTML = `
    
    
    <form >
  <fieldset>

    <div style="margin: 15%; display:flex; align-items:center"">
    <input type="radio" id="batter" name='select' value="batter">
    <label for="batter">Batter</label><br>
</div>
<div style="margin: 15%; display:flex; align-items:center">
    <input type="radio" id="pitcher" name='select' value="pitcher">
    <label for="pitcher">Pitcher</label><br>
</div>
  </fieldset>
</form>
    

`


document.getElementById("options").append(playerTypeToggle)

document.getElementById("filters").style.display = 'flex'
document.getElementById('batter').onclick = function(){
    getDivision(division, sport, "batter")
}
document.getElementById('pitcher').onclick = function(){
    getDivision(division, sport,  "pitcher")
}

console.log(playerType)
if(playerType == 'batter'){
    document.getElementById('batter').checked = true
}else{
    document.getElementById('pitcher').checked = true

}


    const searchBar = document.getElementById('searchBar')

    searchBar.oninput = function() {
        
        generate_table(division, data, playerType, this.value);
    };   
        

    Object.keys(data).forEach((player) => {
        ranking.push(player);
    });


    document.getElementById('rank-table').innerHTML = `
    

        <table id='data-table'>
            <thead>
                <tr id='table-head'>
                <th>#</th>
                <th>Name</th>
                <th>Pos</th>
                <th>Teams</th>
                <th>Appearances</th>

                <th>Rating</th>
               </tr>
          </thead>
                <tbody id="table-body">
            </tbody>
        </table>
    
    
    
    `
        ;


    const orderedPlayers = Object.keys(orderData).sort((a, b) => {
        return orderData[b].rating - orderData[a].rating;
    });

    const numPos = []
    const Name = []
    const Pos = []
    const Teams = []
    const Appearances = []
    const Rating = []


    if(playerType == "batter" && document.getElementById('qualified').checked == true){
        filterAppearances = 500
    } else if (playerType == 'pitcher'){
        filterApperances = 450
    }else{
        filterAppearances= 0
    }
    console.log(orderData)
    orderedPlayers.forEach((player, index) => {
 

        currentPlayer = orderData[player]


            if( currentPlayer['appearances'] > filterAppearances && (search === '' || currentPlayer['name'].toLowerCase().includes(search.toLowerCase())) && (positionsFilter === 'All' || currentPlayer['pos'].includes(positionsFilter)) && (teamFilter === 'All' || currentPlayer['teams'].includes(teamFilter)) ){
            const teamMappings = {
                'BAL': 'BAL',
                'BOS': 'BOS',
                'NYA': 'NYY', 
                'TBA': 'TB',  
                'TOR': 'TOR',

                'CHA': 'CWS', 
                'CLE': 'CLE',
                'DET': 'DET',
                'KCA': 'KC',  
                'MIN': 'MIN',

                'HOU': 'HOU',
                'ANA': 'LAA', 
                'OAK': 'OAK',
                'SEA': 'SEA',
                'TEX': 'TEX',

                'ATL': 'ATL',
                'MIA': 'MIA', 
                'FLO': 'MIA', 
                'NYN': 'NYM', 
                'PHI': 'PHI',
                'WAS': 'WAS',
                'MON': 'WAS', 

                'CHN': 'CHC', 
                'CIN': 'CIN',
                'MIL': 'MIL',
                'PIT': 'PIT',
                'SLN': 'STL', 

                'ARI': 'ARI',
                'COL': 'COL',
                'LAN': 'LAD', 
                'SDN': 'SD',  
                'SFN': 'SF'   
            };

            
            const updatedTeams = currentPlayer.teams.map(team => teamMappings[team] || team);


                Rating.push(currentPlayer['rating'])
                Name.push(currentPlayer['name'])
                numPos.push(index+1)              
                Teams.push(updatedTeams)
                Appearances.push(currentPlayer['appearances'])
                Pos.push(currentPlayer['pos'])

            }
        }
        

    )


    for (let i = 0; i < Name.length; i++) {
        const tr = document.createElement('tr')


        tr.innerHTML = `
        <td>${numPos[i]}</td>
        <td class="team_option" id="${Name[i]}-${Pos[i]}-${Teams[i]}">${Name[i]}</td>
        <td>${Pos[i]}</td>
        <td>${Teams[i]}</td>
        <td>${Appearances[i]}</td>

        <td>${Rating[i].toFixed(3)}</td>
    `;

    
    
    document.getElementById('table-body').append(tr)
    document.getElementById(`${Name[i]}-${Pos[i]}-${Teams[i]}`).onclick = function(){
        displayPlayerData(Name[i], division, data, playerType)

    }

    }


}









function formatGameTime(dateString) {
    const date = new Date(dateString);

    const day = date.getDate();
    const suffix = ["th", "st", "nd", "rd"][
        (day % 10 > 3 || [11, 12, 13].includes(day % 100)) ? 0 : day % 10
    ];

    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }); 
    const month = date.toLocaleDateString('en-US', { month: 'short' }); 

    let time = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    time = time.toLowerCase().replace(" ", "");

    return `${weekday} ${month} ${day}${suffix} ${time}`;
}


function getDivision(division, sport, playerType='batter') {

    if (sport) {
        pageSport = sport
    }

    if (!sport) {
        sport = pageSport
    }

    console.log(pageSport)


    fetch(`${config[sport]['url']}${division}/${playerType}Rating.json`)
        .then(response => {
            if (!response.ok) {
                    throw new Error('Response was not ok')

            }
            return response.json();
        })

        .then(data => {
            generate_table(division, data, playerType=playerType)
        })

        .catch(error => {
            console.error('Error: ', error)
        })




}








function displayPlayerData(playerName, year, data, playerType) {
    const ranking = []

    document.getElementById('filters').style.display = 'none'
    let csvData= []

    const playerID = ()=>{
        return Object.keys(data).find(key => data[key]['name'] === playerName);
    }
    

    fetch(`https://raw.githubusercontent.com/jmi06/PlayerRankings/refs/heads/master/${year}/${playerType}s/${playerID()}-${playerName}.csv`)
    .then((response)=>{

            if (!response.ok) {
                    throw new Error('Response was not ok')

            }
            return response.text();

    })
    .then((data)=>{
        console.log(data)

        const rows = data.split("\n")
        rows.forEach((row)=>{
            csvData.push(row.split(','))

        })


    

    document.getElementById('options').innerHTML = ""
    document.getElementById('rank-table').innerHTML = ""

    const container = document.createElement('div')
    container.id = 'sub-container'
    container.classList.add('sub-container')

    container.innerHTML = `
    
    <h3 style="margin: 2%; color:white;" onclick=""><a href =""style="color:white;"><-- Back</a></h3>
    <h2 style="color: #a7e7b1; margin: 2%;">${playerName}</h2>


    <div id="rank-table">
        <table id='data-table' style='width: 90%'>
            <thead>
                <tr id='table-head'>
                <th>Date</th>
                <th>Inning</th>
                <th>Opposing Team</th>
                <th>Opponent</th>
                <th>Opponent Rating</th>
                <th>Event</th>
                <th>Result</th>
                <th>Delta</th>
                <th>New Rating</th>
               </tr>
          </thead>
                <tbody id="table-body">
            </tbody>
        </table>
    
    
    </div>
    
    `
        ;




    const dates = []
    const innings = []
    const opponentsTeam = []

    const opponents = []
    const opponentsRating = []
    const event = []
    const won = []
    const delta = []
    const newRating = []



    csvData.reverse()
    csvData.forEach((ab, index) => {

        dates.push(ab[0])

        innings.push(ab[1])
        opponentsTeam.push(ab[10])
        opponents.push(ab[9])
        opponentsRating.push(ab[11])
        event.push(ab[7])
        won.push(ab[5])
        delta.push(ab[6])
        newRating.push(ab[4])

    


    })

            const teamMappings = {
                'BAL': 'BAL',
                'BOS': 'BOS',
                'NYA': 'NYY', 
                'TBA': 'TB',  
                'TOR': 'TOR',

                'CHA': 'CWS', 
                'CLE': 'CLE',
                'DET': 'DET',
                'KCA': 'KC',  
                'MIN': 'MIN',

                'HOU': 'HOU',
                'ANA': 'LAA', 
                'OAK': 'OAK',
                'SEA': 'SEA',
                'TEX': 'TEX',

                'ATL': 'ATL',
                'MIA': 'MIA', 
                'FLO': 'MIA', 
                'NYN': 'NYM', 
                'PHI': 'PHI',
                'WAS': 'WAS',
                'MON': 'WAS', 

                'CHN': 'CHC', 
                'CIN': 'CIN',
                'MIL': 'MIL',
                'PIT': 'PIT',
                'SLN': 'STL', 

                'ARI': 'ARI',
                'COL': 'COL',
                'LAN': 'LAD', 
                'SDN': 'SD',  
                'SFN': 'SF'   
            };

            
            const updatedTeams = opponentsTeam.map(team => teamMappings[team] || team);

    document.getElementById('footer').before(container)

    for (let i = 1; i < csvData.length-1; i++) {
        const tr = document.createElement('tr')
        let resultClass = '';
        let resultText = '';

        if (csvData[i][5] === "'W'") {
            resultClass = 'green';
            resultText = 'W';
        } else {
            resultClass = 'red';
            resultText = 'L';
        }



        tr.innerHTML = `
        <td>${dates[i]}</td>
        <td>${innings[i]}</td>
        <td>${updatedTeams[i]}</td>
        <td>${opponents[i]}</td>
        <td>${opponentsRating[i]}</td>
        <td class="${resultClass}">${event[i]}</td>
        <td class="${resultClass}">${resultText}</td>
        <td class="${resultClass}">${delta[i]}</td>
        <td>${newRating[i]}</td>

    `;


        document.getElementById('table-body').append(tr)

    }


    })
    console.log(csvData)

}


document.getElementById('searchBar').value = ""





