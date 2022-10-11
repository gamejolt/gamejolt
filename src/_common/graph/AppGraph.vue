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
import { computed, markRaw, onMounted, PropType, ref, Ref, toRaw, toRefs, watch } from 'vue';
import { formatDate } from '../filters/date';
import { useThemeStore } from '../theme/theme.store';

// Try to match site styling.
const fontFamily = `Nunito, 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif`;

const chartOptionsTemplate: ChartOptions<'doughnut' | 'line'> = {
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

const lineChartOptionsTemplate: ChartOptions<'line'> = {
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

const doughnutChartOptionsTemplate: ChartOptions<'doughnut'> = {
	scales: {
		x: { display: false },
		y: { display: false, beginAtZero: true },
	},
};

const backgroundVariantChartOptionsTemplate: ChartOptions<'doughnut' | 'line'> = {
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
</script>

<script lang="ts" setup>
const props = defineProps({
	dataset: {
		type: Array as PropType<any[]>,
		required: true,
	},
	type: {
		type: String as PropType<'line' | 'doughnut'>,
		default: 'line',
	},
	backgroundVariant: {
		type: Boolean,
	},
});

const { dataset, type, backgroundVariant } = toRefs(props);
const { theme } = useThemeStore();

// Frustrating, but having this as a Ref<Chart> was causing volar to slow down
// to a crawl.
const chart = ref() as any;
const graphData = ref({}) as Ref<any>;
const chartOptions = ref({}) as Ref<any>;
const ourColors = ref({}) as Ref<any>;
const canvasElem = ref<HTMLCanvasElement>();

const globalColors = computed(() => {
	let colors = ['#ffffff', '#ccff00', '#31d6ff', '#ff3fac', '#2f7f6f'];
	if (theme.value) {
		if (theme.value.custom) {
			colors = ['#ffffff', '#' + theme.value.darkHighlight_, '#31d6ff', '#ff3fac', '#2f7f6f'];
		} else {
			colors = [
				'#ffffff',
				'#' + theme.value.darkHighlight_,
				'#' + theme.value.darkNotice_,
				'#' + theme.value.darkBacklight_,
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
});

// We gotta deep copy.
Object.assign(chartOptions.value, JSON.parse(JSON.stringify(chartOptionsTemplate)));
Object.assign(ourColors.value, JSON.parse(JSON.stringify(globalColors.value)));

if (type.value === 'line') {
	_mergeOptions(lineChartOptionsTemplate);
} else if (type.value === 'doughnut') {
	_mergeOptions(doughnutChartOptionsTemplate);
}

if (backgroundVariant.value) {
	_mergeOptions(backgroundVariantChartOptionsTemplate);

	ourColors.value[0] = {
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
	ourColors.value[1] = ourColors.value[0];
}

// Will only get called when dataset changes reference.
watch(dataset, _checkData);

onMounted(() => {
	_checkData();

	chart.value = markRaw(
		new Chart(canvasElem.value!, {
			type: type.value,
			data: toRaw(graphData.value),
			options: toRaw(chartOptions.value),
		})
	);
});

// Very hacky way to get our above options merged together when needed.
function _mergeOptions(from: ChartOptions) {
	if (from?.plugins?.tooltip) {
		Object.assign(chartOptions.value.plugins.tooltip, from.plugins.tooltip);
	}
	if (from?.plugins?.legend) {
		Object.assign(chartOptions.value.plugins.legend, from.plugins.legend);
	}
	if (from?.scales?.x) {
		Object.assign(chartOptions.value.scales.x, from.scales.x);
	}
	if (from?.scales?.y) {
		Object.assign(chartOptions.value.scales.y, from.scales.y);
	}
}

function _checkData() {
	if (!dataset.value) {
		return;
	}

	// Work on a raw version of the dataset so that we don't trigger a ton
	// of proxying.
	const rawDataset = toRaw(dataset.value);

	const newGraphData = {
		labels: [] as any[],
		datasets: [] as any[],
	};

	if (type.value === 'line') {
		rawDataset.forEach((series: any, i: number) => {
			const dataset: any = {
				label: series.label,
				data: [],
			};

			Object.assign(dataset, toRaw(ourColors.value[i]));

			for (const row of series.data) {
				if (i === 0) {
					newGraphData.labels.push(formatDate(row[0], 'LLL dd'));
				}

				dataset.data.push(row[1]);
			}

			newGraphData.datasets.push(dataset);
		});
	} else if (type.value === 'doughnut') {
		newGraphData.datasets.push({
			data: [],
		});

		rawDataset.forEach((item: any, i: number) => {
			const dataset = newGraphData.datasets[0];

			dataset.data.push(item.value);

			// We have to override the color info for the chart since the
			// defaults are for line charts. We also skip the first color
			// value since that's only for line charts (white).
			const colorInfo = Object.assign({}, toRaw(ourColors.value[i + 1]));
			colorInfo.backgroundColor = colorInfo.borderColor;
			colorInfo.borderColor = '#000';
			colorInfo.hoverBackgroundColor = '#fff';

			for (const n in colorInfo) {
				if (!dataset[n]) {
					dataset[n] = [];
				}
				dataset[n].push(colorInfo[n]);
			}

			newGraphData.labels.push(item.label);
		});
	}

	graphData.value = newGraphData;

	if (chart.value) {
		chart.value.data = newGraphData;
		chart.value.update();
	}
}
</script>

<template>
	<div
		class="graph full-bleed-xs"
		:class="['graph-' + type, backgroundVariant ? 'graph-background-variant' : '']"
	>
		<div class="chart">
			<canvas ref="canvasElem" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.graph
	padding: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding: 10px

.graph-background-variant
	background-color: inherit !important

@import './line'
@import './pie'
</style>
