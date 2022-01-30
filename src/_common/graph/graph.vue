<script lang="ts">
import {
	ArcElement,
	CategoryScale,
	Chart,
	ChartOptions,
	DoughnutController,
	Legend,
	LinearScale,
	LineController,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js';
import { markRaw, toRaw, watch } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatDate } from '../filters/date';
import { useThemeStore } from '../theme/theme.store';

// Try to match site styling.
const fontFamily = `Nunito, 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif`;

const chartOptions: ChartOptions<'doughnut' | 'line'> = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			position: 'bottom',
			labels: {
				color: '#c1c1c1',
				usePointStyle: true,
				font: {
					family: fontFamily,
				},
			},
		},
		tooltip: {
			cornerRadius: 0,
			titleColor: '#fff',
			titleFont: {
				family: fontFamily,
				size: 14,
			},
			bodyColor: '#c1c1c1',
			bodyFont: {
				family: fontFamily,
				size: 11,
			},
		},
	},
	scales: {
		x: {
			grid: {
				display: false,
			},
		},
		y: {
			beginAtZero: true,
			grid: {
				display: false,
			},
		},
	},
};

const lineChartOptions: ChartOptions<'line'> = {
	plugins: {
		tooltip: {
			// Tells it to show the tooltip even if not hovered directly over
			// the point.
			intersect: false,
			mode: 'index',
		},
	},
	hover: {
		intersect: false,
		mode: 'index',
	},
};

const doughnutChartOptions: ChartOptions<'doughnut'> = {
	scales: {
		x: { display: false },
		y: { display: false, beginAtZero: true },
	},
};

const backgroundVariantChartOptions: ChartOptions<'doughnut' | 'line'> = {
	plugins: {
		legend: {
			display: false,
		},
		tooltip: {
			enabled: false,
		},
	},
	scales: {
		x: { display: false },
		y: { display: false, beginAtZero: true },
	},
};

Chart.register(
	LineController,
	DoughnutController,
	LineElement,
	PointElement,
	ArcElement,
	LinearScale,
	CategoryScale,
	Tooltip,
	Legend
);

@Options({})
export default class AppGraph extends Vue {
	@Prop(Array)
	dataset!: any[];

	@Prop({ type: String, default: 'line' })
	type!: 'line' | 'doughnut';

	@Prop(Boolean)
	backgroundVariant?: boolean;

	themeStore = setup(() => useThemeStore());

	chart: Chart = null as any;
	graphData: any = {};
	chartOptions: any = {};
	ourColors: any = {};

	get globalColors() {
		let colors = ['#ffffff', '#ccff00', '#31d6ff', '#ff3fac', '#2f7f6f'];
		if (this.themeStore.theme) {
			if (this.themeStore.theme.custom) {
				colors = [
					'#ffffff',
					'#' + this.themeStore.theme.darkHighlight_,
					'#31d6ff',
					'#ff3fac',
					'#2f7f6f',
				];
			} else {
				colors = [
					'#ffffff',
					'#' + this.themeStore.theme.darkHighlight_,
					'#' + this.themeStore.theme.darkNotice_,
					'#' + this.themeStore.theme.darkBacklight_,
					'#31d6ff',
				];
			}
		}

		return colors.map(color => {
			return {
				backgroundColor: 'rgba( 255, 255, 255, 0.05 )',
				borderColor: color,
				borderWidth: 1,

				tension: 0.3,

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
			this._mergeOptions(lineChartOptions);
		} else if (this.type === 'doughnut') {
			this._mergeOptions(doughnutChartOptions);
		}

		if (this.backgroundVariant) {
			this._mergeOptions(backgroundVariantChartOptions);

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

		// Will only get called when dataset changes reference.
		watch(
			() => this.dataset,
			() => this.checkData()
		);
	}

	mounted() {
		this.checkData();

		this.chart = markRaw(
			new Chart(this.$refs.canvas as HTMLCanvasElement, {
				type: this.type,
				data: toRaw(this.graphData),
				options: toRaw(this.chartOptions),
			})
		);
	}

	// Very hacky way to get our above options merged together when needed.
	private _mergeOptions(from: ChartOptions) {
		if (from?.plugins?.tooltip) {
			Object.assign(this.chartOptions.plugins.tooltip, from.plugins.tooltip);
		}
		if (from?.plugins?.legend) {
			Object.assign(this.chartOptions.plugins.legend, from.plugins.legend);
		}
		if (from?.scales?.x) {
			Object.assign(this.chartOptions.scales.x, from.scales.x);
		}
		if (from?.scales?.y) {
			Object.assign(this.chartOptions.scales.y, from.scales.y);
		}
	}

	private checkData() {
		if (!this.dataset) {
			return;
		}

		// Work on a raw version of the dataset so that we don't trigger a ton
		// of proxying.
		const rawDataset = toRaw(this.dataset);

		const graphData = {
			labels: [] as any[],
			datasets: [] as any[],
		};

		if (this.type === 'line') {
			rawDataset.forEach((series: any, i: number) => {
				const dataset: any = {
					label: series.label,
					data: [],
				};

				Object.assign(dataset, toRaw(this.ourColors[i]));

				for (const row of series.data) {
					if (i === 0) {
						graphData.labels.push(formatDate(row[0], 'LLL dd'));
					}

					dataset.data.push(row[1]);
				}

				graphData.datasets.push(dataset);
			});
		} else if (this.type === 'doughnut') {
			graphData.datasets.push({
				data: [],
			});

			rawDataset.forEach((item: any, i: number) => {
				const dataset = graphData.datasets[0];

				dataset.data.push(item.value);

				// We have to override the color info for the chart since the
				// defaults are for line charts. We also skip the first color
				// value since that's only for line charts (white).
				const colorInfo = Object.assign({}, toRaw(this.ourColors[i + 1]));
				colorInfo.backgroundColor = colorInfo.borderColor;
				colorInfo.borderColor = '#000';
				colorInfo.hoverBackgroundColor = '#fff';

				for (const n in colorInfo) {
					if (!dataset[n]) {
						dataset[n] = [];
					}
					dataset[n].push(colorInfo[n]);
				}

				graphData.labels.push(item.label);
			});
		}

		this.graphData = graphData;

		if (this.chart) {
			this.chart.data = graphData;
			this.chart.update();
		}
	}
}
</script>

<template>
	<div
		class="graph full-bleed-xs"
		:class="['graph-' + type, backgroundVariant ? 'graph-background-variant' : '']"
	>
		<div class="chart">
			<canvas ref="canvas" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.graph
	padding: ($grid-gutter-width-xs / 2)
	margin-bottom: $line-height-computed

	@media $media-sm-up
		padding: 10px

.graph-background-variant
	background-color: inherit !important

@import './line'
@import './pie'
</style>
