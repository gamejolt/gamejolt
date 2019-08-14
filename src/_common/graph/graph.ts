import Vue from 'vue';
import * as Chart from 'chart.js';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { date } from '../../vue/filters/date';
import { ThemeState, ThemeStore } from '../theme/theme.store';

// Try to match site styling.
const fontFamily = `Nunito, 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif`;

const chartOptions: any = {
	responsive: true,
	maintainAspectRatio: false,

	legend: {
		position: 'bottom',
		// Gotta silence stupid TS error.
		labels: {
			fontColor: '#c1c1c1',
			usePointStyle: true,
			fontFamily,
		},
	},

	scales: {
		xAxes: [
			{
				gridLines: {
					display: false,
				},
			},
		],
		yAxes: [
			{
				gridLines: {
					display: false,
				},
				ticks: {
					beginAtZero: true,
				},
			},
		],
	},

	tooltips: {
		cornerRadius: 0,
		titleFontFamily: fontFamily,
		titleFontColor: '#fff',
		titleFontSize: 14,
		bodyFontFamily: fontFamily,
		bodyFontColor: '#c1c1c1',
		bodyFontSize: 11,
	},
};

const lineChartOptions: any = {
	tooltips: {
		// Tells it to show the tooltip even if not hovered directly over
		// the point.
		intersect: false,
		mode: 'index',
	},

	hover: {
		intersect: false,
		mode: 'index',
	},
};

const pieChartOptions: any = {
	scales: {
		xAxes: [{ display: false }],
		yAxes: [{ display: false, ticks: { beginAtZero: true } }],
	},
};

const backgroundVariantChartOptions: any = {
	legend: {
		display: false,
	},
	scales: {
		xAxes: [{ display: false }],
		yAxes: [{ display: false, ticks: { beginAtZero: true } }],
	},
	tooltips: {
		enabled: false,
	},
};

@Component({})
export default class AppGraph extends Vue {
	@Prop(Array) dataset!: any[];
	@Prop({ type: String, default: 'line' })
	type!: string;
	@Prop(Boolean) backgroundVariant?: boolean;

	@ThemeState theme?: ThemeStore['theme'];

	chart: Chart = null as any;
	data: any = {};
	chartOptions: any = {};
	ourColors: any = {};

	get globalColors() {
		let colors = ['#ffffff', '#ccff00', '#31d6ff', '#ff3fac', '#2f7f6f'];
		if (this.theme) {
			if (this.theme.custom) {
				colors = ['#ffffff', '#' + this.theme.darkHighlight_, '#31d6ff', '#ff3fac', '#2f7f6f'];
			} else {
				colors = [
					'#ffffff',
					'#' + this.theme.darkHighlight_,
					'#' + this.theme.darkNotice_,
					'#' + this.theme.darkBacklight_,
					'#31d6ff',
				];
			}
		}

		return colors.map(color => {
			return {
				backgroundColor: 'rgba( 255, 255, 255, 0.05 )',
				borderColor: color,
				borderWidth: 1,

				pointRadius: 4,
				pointBorderWidth: 2,
				pointBackgroundColor: color,
				pointBorderColor: '#191919',
				pointHoverBackgroundColor: '#fff',
				pointHoverBorderColor: '#fff',
			};
		});
	}

	created() {
		// We gotta deep copy.
		Object.assign(this.chartOptions, JSON.parse(JSON.stringify(chartOptions)));
		Object.assign(this.ourColors, JSON.parse(JSON.stringify(this.globalColors)));

		if (this.type === 'line') {
			Object.assign(this.chartOptions, lineChartOptions);
		} else if (this.type === 'pie' || this.type === 'doughnut') {
			Object.assign(this.chartOptions, pieChartOptions);
		}

		if (this.backgroundVariant) {
			Object.assign(this.chartOptions, backgroundVariantChartOptions);

			this.ourColors[0] = {
				borderWidth: 1,
				pointRadius: 0,
				pointHoverRadius: 0,
				pointBorderWidth: 0,
				backgroundColor: 'rgba( 127, 127, 127, 0.10 )',
				borderColor: '#7e7e7e',
				pointBackgroundColor: '#7e7e7e',
				pointHoverBackgroundColor: '#7e7e7e',
				pointHoverBorderColor: '#7e7e7e',
			};
			this.ourColors[1] = this.ourColors[0];
		}
	}

	mounted() {
		this.checkData();

		this.chart = new Chart(this.$refs.canvas as HTMLCanvasElement, {
			type: this.type,
			data: this.data,
			options: this.chartOptions,
		});
	}

	// Will only get called when dataset changes reference.
	@Watch('dataset')
	onDatasetChanged() {
		this.checkData();
	}

	private checkData() {
		if (!this.dataset) {
			return;
		}

		this.data = {
			labels: [],
			datasets: [],
		};

		if (this.type === 'line') {
			this.dataset.forEach((series: any, i: number) => {
				let dataset: any = {
					label: series.label,
					data: [],
				};

				Object.assign(dataset, this.ourColors[i]);

				for (const row of series.data) {
					if (i === 0) {
						this.data.labels.push(date(row[0], 'MMM DD'));
					}

					dataset.data.push(row[1]);
				}

				this.data.datasets.push(dataset);
			});
		} else if (this.type === 'pie' || this.type === 'doughnut') {
			this.data.datasets.push({
				data: [],
			});

			this.dataset.forEach((item: any, i: number) => {
				const dataset = this.data.datasets[0];

				dataset.data.push(item.value);

				// We have to override the color info for the chart since the
				// defaults are for line charts. We also skip the first color
				// value since that's only for line charts (white).
				const colorInfo = Object.assign({}, this.ourColors[i + 1]);
				colorInfo.backgroundColor = colorInfo.borderColor;
				colorInfo.borderColor = '#000';
				colorInfo.hoverBackgroundColor = '#fff';

				for (const n in colorInfo) {
					if (!dataset[n]) {
						dataset[n] = [];
					}
					dataset[n].push(colorInfo[n]);
				}

				this.data.labels.push(item.label);
			});
		}

		if (this.chart) {
			this.chart.data = this.data;
			this.chart.update();
		}
	}
}
