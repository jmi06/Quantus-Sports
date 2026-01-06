let highToLow;

getDivision('all')


function getDivision(division) {









    fetch('https://falling-frog-ec91.jmi06.workers.dev')
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


                
                if(stat == 'team_name'){
                    new_stat = team[0]
                }
                if(stat == 'elo'){
                    new_stat = team[1]['elo']
                }

                if (stat == "games") {
                    new_stat = team[1]['games'].length


                } 
                if (stat == "record"){
                    if(team[1]['record']){

                        new_stat = team[1]['record'].split('-')
                        new_stat = new_stat[0] / ( Number(new_stat[0]) + Number(new_stat[1]))
                        new_stat = new_stat.toFixed(3);

                        if(new_stat < 1){
                            new_stat = new_stat.slice(1)
                        }


                    } else{
                        new_stat = '--'
                    }
                } 
               
                const td = document.createElement("td");
                td.textContent = new_stat || ''; // Handle undefined properties
                tr.appendChild(td);
            });


            tableBody.appendChild(tr);


        });




    } 










// function sortTable(highToLow, column, data, division){


//     if(highToLow == true){

        

//             if(column == "Elo"){
//                 new_column = "elo"
//             } 
    
//             if (column == "Games"){
//                 new_column ="race_num"
//             } 
//             if (column == "Record"){
//                 new_column ="games"
//             } 

            
//             const dataArray = Object.entries(data[division]);

//             let sorted_teams = dataArray.sort((a, b) => a[new_column] - b[new_column]);
//             console.log(sorted_teams)
//             const sortedData = Object.fromEntries(sorted_teams);
//             console.log(sortedData)
//             generate_table(sortedData, "All")




        



//     } else if(highToLow == false){

        

//             if(column == "Elo"){
//                 new_column = "elo"
//             } 
//             if (column == "Name"){
//                 new_column ="name"
//             } 
//             if (column == "Races"){
//                 new_column ="race_num"
//             } 
//             if (column == "Playoff Points"){
//                 new_column ="playoff_points"
//             } 
//             if(column == 'NASCAR Position'){
//                 new_column = 'position'
//             }
//             const dataArray = Object.values(data);
            
//             let sorted_teams = dataArray.sort((a, b) => a[new_column] - b[new_column]);
//             sorted_teams = sorted_teams.reverse()
//             const sortedData = Object.fromEntries(sorted_teams);

//             generate_table(sortedData, "All")




         





//     }

// }
