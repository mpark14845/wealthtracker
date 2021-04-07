//Chart Demo
function renderTotalWealthPieChart(assets, debts) {
  try{myChart.destroy();}
  catch{}
  ctx = document.getElementById("chartTotalWealth").getContext("2d");
  
  
    myChart = new Chart(ctx, {
      type: "doughnut",        
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },          
        }
      },
      data: {
        labels: ["Assets", "Debts"],
        datasets: [
          {
            label: "Net Worth",
            pointRadius: 0,
            pointHoverRadius: 0,
            backgroundColor: ["#28A745", "#DC3545"],
            borderWidth: 0,
            data: [assets, debts],
          },
        ],
      },
    });
  }
  //End Chart