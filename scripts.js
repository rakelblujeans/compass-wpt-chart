'use strict';
var moment = require('moment');
var Chart = require('chart.js');

window.chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

var timeFormat = 'MM/DD/YYYY HH:mm';

// function newDate(days) {
//   return moment().add(days, 'd').toDate();
// }
// function newDateString(days) {
//   return moment().add(days, 'd').format(timeFormat);
// }
// function newTimestamp(days) {
//   return moment().add(days, 'd').unix();
// }

function fetchData() { // TODO: fromTime, toTime
  const url = `http://compass-wpt.herokuapp.com/charts`;
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    renderChart(data);
  })
  .catch(function(error) {
    console.log(JSON.stringify(error));
  });
}

function getDates(data) {
  return data.map((record) => moment(record.timestamp).format(timeFormat));
}

function getField(data, fieldName) {
  return data.map((record) => record.firstView[fieldName]);
}

function renderChart(data) {
  var ctx = document.getElementById("myChart").getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: getDates(data),
          datasets: [{
              label: 'TTFB',
              backgroundColor: window.chartColors.green,
              borderColor: window.chartColors.green,
              data: getField(data, 'ttfb'),
              fill: false,
          }, {
              label: 'Time to First Render',
              backgroundColor: window.chartColors.red,
              borderColor: window.chartColors.red,
              data: getField(data, 'render'),
              fill: false,
          }, {
              label: 'SpeedIndex',
              backgroundColor: window.chartColors.yellow,
              borderColor: window.chartColors.yellow,
              data: getField(data, 'speedIndex'),
              fill: false,
          }, {
              label: '# Dom Elements',
              backgroundColor: window.chartColors.orange,
              borderColor: window.chartColors.orange,
              data: getField(data, 'domElements'),
              fill: false,
          }, {
              label: 'Fully Loaded Time',
              backgroundColor: window.chartColors.purple,
              borderColor: window.chartColors.purple,
              data: getField(data, 'fullyLoadedTime'),
              fill: false,
          }]
      },
      options: {
          responsive: true,
          title:{
            display: true,
            text: 'Compass - WebPageTest Stats'
          },
          tooltips: {
            mode: 'index',
            intersect: false,
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
          scales: {
            xAxes: [{
              type: "time",
              time: {
                format: timeFormat,
                // round: 'day'
                tooltipFormat: 'll HH:mm'
              },
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Millis'
              },
              ticks: {
                beginAtZero:true
              }
            }]
          }
      }
  });
}

fetchData();
