import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { BaseChartDirective } from 'ng2-charts/ng2-charts';

import * as moment from 'moment/moment';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, OnDestroy {
  @ViewChild( BaseChartDirective ) chart: BaseChartDirective;
  fromDate: string;
  toDate: string;
  // Prevent the UI from triggering additional requests for data
  disableUiUpdates: boolean;
  label: string;
  dateFormat: string;
  timeFormat: string;
  chartOptions: Object;
  chartData: Object;
  dates: Array<Object>;
  datePickerConfig: Object;
  data: Array<Object>;
  paramSubscription: any;

  constructor(
      private activatedRoute: ActivatedRoute,
      private changeDetectorRef: ChangeDetectorRef,
      private router: Router
  ) {
    this.timeFormat = 'MM/DD/YYYY HH:mm';
    this.datePickerConfig = {
      allowMultiSelect: false,
      format: 'MM-DD-YYYY',
    };
  }

  ngOnInit() {
    // Subscribe to router event
    this.paramSubscription = this.activatedRoute.queryParams.subscribe((params: Params) => {
      console.log(params);

      // Assume timestamps are specified as UTC millis in the URL.
      // I'm not overly concerned with timezones right now.
      let toDate;
      let fromDate;
      if (params.to && !params.from) {
        toDate = moment.utc(parseInt(params.to, 10));
        fromDate = moment.utc(parseInt(params.to, 10)).subtract(1, 'month');
      } else if (!params.to && params.from) {
        fromDate = moment.utc(parseInt(params.from, 10));
        toDate = moment.utc(parseInt(params.from, 10)).add(1, 'month');
      } else if (!params.to && !params.from) {
        toDate = moment.utc();
        fromDate = moment.utc().subtract(1, 'month');
      } else {
        fromDate = moment.utc(parseInt(params.from, 10));
        toDate = moment.utc(parseInt(params.to, 10));
      }
      this.fromDate =  fromDate.format(this.timeFormat);
      this.toDate =  toDate.format(this.timeFormat);

      this.chartOptions = this._buildChartOptions(params.label);
      this._initializeChart(params.label, fromDate, toDate);
    });
  }

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
  }

  _buildChartOptions(label) {
    this.label = label;
    return {
      responsive: true,
      title: {
        display: true,
        text: this.label,
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
          type: 'time',
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
            beginAtZero: true
          }
        }]
      }
    };
  }

  _initializeChart(label, fromDate, toDate) {
    this.disableUiUpdates = true;
    const url = `http://compass-wpt.herokuapp.com/charts?label=${label}&from=${fromDate}&to=${toDate}`;
    fetch(url)
    .then((resp): Promise<Array<Object>> => resp.json())
    .then((data: Array<Object>) => {
      this.data = data;
      this.dates = this.getDates(data);
      // Note: the endpoint returns data sorted according to timestamp
      if (this.dates && this.dates.length) {
        this.chartData = this.buildDataSet(data);
      }
      this.disableUiUpdates = false;
      this.changeDetectorRef.detectChanges();
      this.chart && this.chart.ngOnChanges({});
      this.changeDetectorRef.detectChanges();
    })
    .catch((error) => {
      console.log('ERROR', JSON.stringify(error));
      this.disableUiUpdates = false;
    });
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

  getField(data: Array<Object>, fieldName: string): any {
    return data.map((record: any) => record.firstView[fieldName]);
  }

  getDates(data: Array<Object>): Array<string> {
    return data.map((record: any) => moment.utc(record.timestamp).format(this.timeFormat));
  }

  formatDate(timestamp: string): string {
    return moment(timestamp).format('MM/DD/YYYY HH:mm A');
  }

  onFromDateChange(event: any) {
    if (event && event !== this.fromDate && !this.disableUiUpdates) {
      this.disableUiUpdates = true;
      const from = moment.utc(event, this.timeFormat);
      const to = moment.utc(event, this.timeFormat).add(1, 'month');
      this.fromDate = from.format(this.timeFormat);
      this.toDate = to.format(this.timeFormat);

      this.router.navigate(['chart'], {
        queryParams: {
          label: this.label,
          from: from.valueOf(),
          to: to.valueOf()
        }
      });
    }
  }

  onToDateChange(event) {
    if (event && event !== this.toDate && !this.disableUiUpdates) {
      this.disableUiUpdates = true;
      const to = moment.utc(event, this.timeFormat);
      const from = moment.utc(event, this.timeFormat).subtract(1, 'month');
      this.toDate = to.format(this.timeFormat);
      this.fromDate = from.format(this.timeFormat);

      this.router.navigate(['chart'], {
        queryParams: {
          label: this.label,
          from: from.valueOf(),
          to: to.valueOf()
        }
      });
    }
  }
}
