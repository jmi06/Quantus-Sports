let highToLow;

getDivision('all')

let teamData = {}
let futureGames = {}

function formatGameTime(dateString) {
    const date = new Date(dateString);

    // 1. Calculate the ordinal suffix (st, nd, rd, th)
    const day = date.getDate();
    const suffix = ["th", "st", "nd", "rd"][
        (day % 10 > 3 || [11, 12, 13].includes(day % 100)) ? 0 : day % 10
    ];

    // 2. Get the parts using standard locale methods
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }); // "Saturday"
    const month = date.toLocaleDateString('en-US', { month: 'short' });   // "Oct"

    // 3. Get time and clean it up (7:00 PM -> 7:00pm)
    let time = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
    
    // Convert to lowercase and remove the space to match your request
    time = time.toLowerCase().replace(" ", ""); 

    // 4. Combine them
    return `${weekday} ${month} ${day}${suffix} ${time}`;
}

async function getUpcomingGames(teamRatings) {


    const acc = teamRatings['predictionAccuracy']['acc'].split('-')
    document.getElementById('accuracy').innerText = `Prediction Accuracy: ${acc[0]}-${acc[1]}-${acc[2]} (${  ((Number(acc[0])/(Number(acc[0])+Number(acc[1])))*100).toFixed(1)   }%)`


    const today = new Date()
    const future = new Date()
    future.setDate(future.getDate()+3)
    const dashlessDate = new Intl.DateTimeFormat('en-CA').format(today).replace(/-/g, '');
    const dashlessFutureDate = new Intl.DateTimeFormat('en-CA').format(future).replace(/-/g, '');


    try {
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?dates=${dashlessDate}-${dashlessFutureDate}`);

        if (!response.ok) {
            throw new Error("Response was not ok");
        }

        const data = await response.json();

        let futureGames = data;
        


      

        for(let i=0; i<futureGames["events"].length; i++){


            const homeTeam = futureGames["events"][i]['competitions'][0]['competitors'][0]['team']['displayName']
            const awayTeam = futureGames["events"][i]['competitions'][0]['competitors'][1]['team']['displayName']

            const homeTeamShort = futureGames["events"][i]['competitions'][0]['competitors'][0]['team']['shortDisplayName']
            const awayTeamShort = futureGames["events"][i]['competitions'][0]['competitors'][1]['team']['shortDisplayName']

            const homeTeamRating = teamRatings['all'][homeTeam]['elo'];
            const awayTeamRating = teamRatings['all'][awayTeam]['elo'];
            const gameTime = new Date(futureGames['events'][i]['date'])
            

            const homeTeamProb = 1 / (1+10** ((awayTeamRating-homeTeamRating)/400) )
            const awayTeamProb = 1 / (1+10** ((homeTeamRating-awayTeamRating)/400) )

            if(homeTeamProb > awayTeamProb){

                const message = `<h4 id="gameTime">${formatGameTime(gameTime)}</h4> <h3><span id="hometeam" style="color:#e7b0a7">${homeTeamShort} (${homeTeamRating})</span> @ <span id="awayteam" style="color:#e7a7da">${awayTeamShort} (${awayTeamRating})</span> | <span style="color:#e7b0a7">${(homeTeamProb*100).toFixed(1)}% ${homeTeamShort}</span>`
                document.getElementById('predictions').innerHTML += message
                
            } else if(homeTeamProb < awayTeamProb){
                const message = `<h4>${formatGameTime(gameTime)}</h4> <h3><span id="hometeam" style="color:#e7b0a7">${homeTeamShort} (${homeTeamRating})</span> @ <span id="awayteam"style="color:#e7a7da">${awayTeamShort} (${awayTeamRating})</span> | <span style="color:#e7a7da">${(awayTeamProb*100).toFixed(1)}% ${awayTeamShort}</span>`
                document.getElementById('predictions').innerHTML += message
                
            } else if (homeTeamProb == awayTeamProb){
                const message = `<h4>${formatGameTime(gameTime)}</h4> <h3><span id="hometeam" style="color:#e7b0a7">${homeTeamShort} (${homeTeamRating})</span> @ <span id="awayteam" style="color:#e7a7da">${awayTeamShort} (${awayTeamRating})</span> | ${(awayTeamProb*100).toFixed(1)}%`
                document.getElementById('predictions').innerHTML += message
                

            }

            


        }

        return futureGames;

    } catch (error) {
        console.error('Error: ', error);
    }






}

function getDivision(division) {









    fetch('https://falling-frog-ec91.jmi06.workers.dev/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Response was not ok')

            }
            return response.json();
        })

        .then(data => {
            
            getUpcomingGames(data)



        })

        .catch(error => {
            console.error('Error: ', error)
        })




}


const teamRatings = getDivision('All')





