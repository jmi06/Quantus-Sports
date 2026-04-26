const td = document.querySelectorAll('td')

td.forEach((el)=>{
    if(el.innerText == 'W'){
        el.style.color = "#4ECCA3"
    }
    if(el.innerText == 'L'){
        el.style.color = "#FF6B6B"
    }
})



function buildTeamChart(dates, rating) {
    const pageColour = getComputedStyle(document.querySelector('.logo')).color
    console.log(rating)
    console.log(dates)
    new Chart("graph", {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                pointRadius: 0,
                label: "Rating",
                data: rating,
                borderColor: pageColour,
                backgroundColor: pageColour
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


