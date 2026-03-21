async function updateRatingsTable(division, sport){
    const response = await fetch(`/${sport}/divisions?division=${division}`)
    const data = await response.json()
    const table = document.getElementById('table-body')

    table.innerHTML = ''

    Object.values(data).forEach((element,index) => {
        const tr = document.createElement('tr')
        tr.innerHTML = `
            <td>${index+1}</td>
            <td>${element[0]}</td>

            <td>${element[1]['elo']}</td>
            <td>${element[1]['games'].length}</td>
            <td>${getPCT(element[1]['record'], sport)}</td>
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