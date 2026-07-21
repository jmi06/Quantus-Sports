
async function updateRatingsTable(division, sport){
    let shortsport;
    console.log(sport)
    switch(sport){
        case "NBAbasketball":
            shortsport= "basketball"
            break;
        case "NHLhockey":
            shortsport= "hockey"
            break;
        case "MLBbaseball":
            shortsport= "baseball"
            break;
        default:
            shortsport="nones"
        }

    const response = await fetch(`/${sport}/divisions?division=${division}`)
    const data = await response.json()
    const table = document.getElementById('table-body')

    const currentlySelected = document.getElementsByClassName("selected-division")
    currentlySelected[0].classList.remove('selected-division')

    const newlySelected = document.getElementById(division)
    newlySelected.classList.add('selected-division')

    table.innerHTML = ''

    Object.values(data).forEach((element,index) => {
        const tr = document.createElement('tr')
        tr.setAttribute("id", `${element[0]}`)
        tr.classList.add('click-pointer')
        tr.onclick = function(){

            window.location.href= `/${sport}/team?team=${element[0]}`;
        } 
        tr.innerHTML = `
            <td>${index+1}</td>
            <td>${element[0]}</td>
            <td style="text-align: center;">${element[1]['elo']}</td>
            <td style="text-align: center;">${element[1]['games'].length}</td>
            <td style="text-align: center;">${getPCT(element[1]['record'], sport)}</td>
        `   
        table.appendChild(tr)
    });
}



async function updateRatingsTablePageRank(division, sport){
    let shortsport;
    console.log(sport)
    switch(sport){
        case "NBAbasketball":
            shortsport= "basketball"
            break;
        case "NHLhockey":
            shortsport= "hockey"
            break;
        case "MLBbaseball":
            shortsport= "baseball"
            break;
        default:
            shortsport="nones"
        }

    const response = await fetch(`/${sport}/divisions?division=${division}`)
    const data = await response.json()
    const table = document.getElementById('table-body')

    const currentlySelected = document.getElementsByClassName("selected-division")
    currentlySelected[0].classList.remove('selected-division')

    const newlySelected = document.getElementById(division)
    newlySelected.classList.add('selected-division')

    table.innerHTML = ''
    const sortedData = Object.entries(data).sort((a, b) => {
            return b[1][1]['index_score'] - a[1][1]['index_score'];
    });
    console.log(sortedData)
    sortedData.forEach((element,index) => {
        const tr = document.createElement('tr')
        tr.setAttribute("id", `${element[0]}`)
        tr.classList.add('click-pointer')
        tr.onclick = function(){

            window.location.href= `/${sport}/team?team=${element[1][0]}`;
        } 
        tr.innerHTML = `
            <td>${index+1}</td>
            <td>${element[1][0]}</td>
            <td style="text-align:center;">${element[1][1]['index_score'].toFixed(2)}</td>
            <td style="text-align:center;">${element[1][1]['games'].length}</td>
            <td style="text-align:center;">${getPCT(element[1][1]['record'], sport)}</td>
        `   
        table.appendChild(tr)
    });
}


async function updateRatingsTablePR(timeframe, sport){
    let shortsport;
    console.log(sport)
    switch(sport){
        case "NBAbasketball":
            shortsport= "basketball"
            break;
        case "NHLhockey":
            shortsport= "hockey"
            break;
        case "MLBbaseball":
            shortsport= "baseball"
            break;
        default:
            shortsport="nones"
        }

    const response = await fetch(`/${sport}/powerrankingsdata`)
    const data = await response.json()
    const table = document.getElementById('table-body')

    table.innerHTML = ''
    const currentlySelected = document.getElementsByClassName("selected-division")
    currentlySelected[0].classList.remove('selected-division')

    const newlySelected = document.getElementById(timeframe)
    newlySelected.classList.add('selected-division')

    Object.values(data[timeframe]).forEach((element,index) => {
        const tr = document.createElement('tr')
        tr.setAttribute("id", `${element[0]}`)
        tr.classList.add('click-pointer')
        tr.onclick = function(){

            window.location.href= `/${sport}/team?team=${element[0]}`;
        } 
        tr.innerHTML = `
            <td>${index+1}</td>
            <td>${element[0]}</td>
            <td>${element[1]['rating']}</td>
        `   
        
        table.appendChild(tr)
    });

    
}

function getPCT(record,sport){
    if (sport == "NHLhockey"){
        const fields = record.split('-')
        const wins = parseFloat(fields[0]) + parseFloat(fields[2])
        const losses = parseFloat(fields[1])

        return (wins/(wins+losses)).toFixed(2)
    } else{
        const fields = record.split('-')
        const wins = parseFloat(fields[0])
        const losses = parseFloat(fields[1])

        return (wins/(wins+losses)).toFixed(2)

    }




}

async function displayTeamData(teamname, sport){
    const response = await fetch(`/${sport}/divisions?division=${division}`)
    const data = await response.json()

}