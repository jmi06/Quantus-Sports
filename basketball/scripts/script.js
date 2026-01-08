let highToLow;

getDivision('all')


function getDivision(division) {









    fetch('https://dark-mountain-23d8.jmi06.workers.dev/')
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





function generate_table(division, data) {
    // Race data is "All" if its just all driver standings





    orderData = data[division]

    const table = document.getElementById('data-table')

    const tableHead = document.getElementById("table-head");
    const tableBody = document.getElementById("table-body");

    tableHead.innerText = ""

    const headers = ['Pos', 'Team', 'Elo', 'Games', 'Record']
    const header_stat = ["team_name", "elo", 'games', "record"]

    // Do Playoff points and position separate




    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        // th.onclick = () => {
        //     if (th.textContent != "Pos" || th.textContent != "Team"){

        //     // chosen_year = year; // Update chosen_year
        //     highToLow = !highToLow   
        //     sortTable(highToLow, header, data, division);
        //     }
        // };

        tableHead.appendChild(th);
    });

    let new_stat;
    tableBody.innerText = ""
    Object.entries(orderData).forEach((team, index) => {
        const tr = document.createElement("tr");

        const positionTd = document.createElement("td");
        positionTd.textContent = index + 1; // Position starts from 1, not 0
        tr.appendChild(positionTd);

        header_stat.forEach(stat => {

            let team_name = "";



            if (stat == 'team_name') {
                new_stat = team[0]
                team_name = team[0];
            }

            if (stat == 'elo') {
                new_stat = team[1]['elo']
            }

            if (stat == "games") {
                new_stat = team[1]['games'].length


            }
            if (stat == "record") {
                if (team[1]['record']) {

                    new_stat = team[1]['record'].split('-')
                    new_stat = new_stat[0] / (Number(new_stat[0]) + Number(new_stat[1]))
                    new_stat = new_stat.toFixed(3);

                    if (new_stat < 1) {
                        new_stat = new_stat.slice(1)
                    }


                } else {
                    new_stat = '--'
                }
            }

            const td = document.createElement("td");
            td.textContent = new_stat || ''; // Handle undefined properties

            if (team_name) {
                td.classList.add('team_option')
                td.addEventListener('click', () => { displayTeamData(team_name, data) })

            }

            tr.appendChild(td);
        });


        tableBody.appendChild(tr);


    });




}







function displayTeamData(team_name, data) {

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

    
    <h2 style="color: #e7bba7; margin: 2%;">#${ranking.indexOf(team_name)+1} ${team_name} (${data['all'][team_name]['record']})</h2>

    <div style="width: 80%; height:50vh;     margin:auto; margin-bottom: 1%">
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


    const gamesPlayed = data['all'][team_name]['games']


    const dates = []
    const opponents = []
    const scores = []
    const delta = []
    const won = []
    const rating = []


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


    new Chart("graph", {
  type: "line",
  data: {
    labels: dates,
    datasets: [{
    pointRadius: 0,
      label: "Rating",
      data: rating,
      borderColor: "#e7bba7",
      backgroundColor: "#e7bba7"
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





