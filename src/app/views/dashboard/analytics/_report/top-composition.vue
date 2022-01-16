<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import AppGraph from '../../../../../_common/graph/graph.vue';
import { Screen } from '../../../../../_common/screen/screen-service';

@Options({
	components: {
		AppGraph,
	},
})
export default class AppAnalyticsReportTopComposition extends Vue {
	@Prop(Object) reportData!: any;

	readonly Screen = Screen;
	readonly formatNumber = formatNumber;

	isScalarLabel(val: any) {
		return typeof val.label !== 'object';
	}
}
</script>

<template>
	<div>
		<!--
		If graph data is null, then don't show the graph and give more space for the
		table.
		-->
		<div :class="reportData.graph !== null ? 'col-sm-8' : 'col-xs-12'">
			<div v-if="!reportData.hasData" class="alert">
				<translate>No data yet.</translate>
			</div>

			<table v-if="reportData.hasData" class="table table-striped table-condensed">
				<thead>
					<tr>
						<th style="width: 20px" />
						<th>
							{{ reportData.fieldLabel }}
						</th>
						<th class="text-right" />
						<th style="width: 150px" />
					</tr>
				</thead>
				<tbody>
					<tr v-for="(val, i) of reportData.data" :key="i">
						<td>{{ formatNumber(i + 1) }}.</td>
						<th>
							<template v-if="isScalarLabel(val)">
								{{ val.label }}
							</template>
							<router-link
								v-else
								:to="{
									name: 'dash.analytics',
									params: {
										resource: val.label.resource,
										resourceId: val.label.resourceId,
									},
								}"
							>
								{{ val.label.value }}
							</router-link>
						</th>
						<td class="text-right">
							{{ formatNumber(val.value) }}
						</td>
						<td>
							<div
								class="report-percentage"
								:style="{ width: (val / reportData.total) * 70 + 'px' }"
							/>
							<small>
								{{
									formatNumber(val.value / reportData.total, {
										style: 'percent',
										maximumFractionDigits: 2,
									})
								}}
							</small>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div
			v-if="!Screen.isXs && reportData.hasData && reportData.graph !== null"
			class="col-sm-4"
		>
			<app-graph type="doughnut" :dataset="reportData.graph" />
		</div>
	</div>
</template>

<style lang="stylus" src="./report-percentage.styl" scoped></style>
