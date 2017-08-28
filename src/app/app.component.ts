import { Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts/ng2-charts';

import * as moment from 'moment/moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild( BaseChartDirective ) chart: BaseChartDirective;
  fromDate: string;
  toDate: string;
  title: string;
  dateFormat: string;
  timeFormat: string;
  chartOptions: Object;
  chartData: Object;
  dates: Array<Object>;
  datePickerConfig: Object;
  data: Array<Object>;

  constructor() {
    this.title = 'app';
    this.timeFormat = 'MM/DD/YYYY HH:mm';
    this.datePickerConfig = {
      allowMultiSelect: false,
      format: 'MM-DD-YYYY',
    };
    this.chartOptions = {
      responsive: true,
      title:{
        display: true,
        text: '/search/sales/nyc/'
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
            format: this.timeFormat,
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
    };
  }

  ngOnInit() {
    this.initialChart();
  }

  initialChart() { // TODO: different endpoints
    const url = `http://compass-wpt.herokuapp.com/charts`;
    fetch(url)
    .then((resp): Promise<Array<Object>> => resp.json())
    .then((data: Array<Object>) => {
      this.data = data;
      this.dates = this.getDates(data);

      // The endpoint sends data back sorted according to timestamp
      if (this.dates && this.dates.length) {
        // Defaults to showing data for the last month
        this.toDate = this.dates[this.dates.length - 1] as string;
        this.fromDate = moment(this.toDate, this.timeFormat).subtract(1, 'month')
            .format(this.timeFormat);
        this.chartData = this.buildDataSet(data);
      }
    })
    .catch(function(error) {
      console.log(JSON.stringify(error));
    });
  }

  refreshChart() {
    this.dates = this.getDates(this.data);
    this.chartData = this.buildDataSet(this.data);
    this.chart.ngOnChanges({});
  }

  buildDataSet(data: Array<Object>): Array<Object> {
    return [{
        label: 'TTFB',
        data: this.getField(data, 'ttfb'),
        fill: false,
    }, {
        label: 'Time to First Render',
        data: this.getField(data, 'render'),
        fill: false,
    }, {
        label: 'SpeedIndex',
        data: this.getField(data, 'speedIndex'),
        fill: false,
    }, {
        label: '# Dom Elements',
        data: this.getField(data, 'domElements'),
        fill: false,
    }, {
        label: 'Fully Loaded Time',
        data: this.getField(data, 'fullyLoadedTime'),
        fill: false,
    }];
  }

  filterByDates(data: Array<Object>): Array<Object> {
    if (!this.fromDate && !this.toDate) {
      return data;
    }

    const minDate = this.fromDate && moment.utc(this.fromDate, this.timeFormat)
    const maxDate = this.toDate && moment.utc(this.toDate, this.timeFormat).add(1, 'day');
    return data.filter((record: any) => {
      const timestamp = moment.utc(record.timestamp);
      // Make sure to include data from the current day
      if (minDate && timestamp.isBefore(minDate)) {
        return false;
      }
      if (maxDate && timestamp.isAfter(maxDate)) {
        return false;
      }

      return true;
    });
  }

  getField(data: Array<Object>, fieldName: string): any {
    const filteredData = this.filterByDates(data)
    return filteredData.map((record: any) => record.firstView[fieldName]);
  }

  getDates(data: Array<Object>): Array<string> {
    const filteredData = this.filterByDates(data)
    return filteredData.map((record: any) => moment.utc(record.timestamp).format(this.timeFormat));
  }

  formatDate(timestamp: string): string {
    return moment(timestamp).format('MM/DD/YYYY HH:mm A');
  }

  onFromDateChange(event: any) {
    if (event !== this.fromDate) {
      this.fromDate = event ? moment.utc(event, this.timeFormat).format(this.timeFormat) : null;
      this.refreshChart();
    }
  }

  onToDateChange(event) {
    if (event !== this.toDate) {
      this.toDate = event ? moment.utc(event, this.timeFormat).format(this.timeFormat) : null;
      this.refreshChart();
    }
  }
}
