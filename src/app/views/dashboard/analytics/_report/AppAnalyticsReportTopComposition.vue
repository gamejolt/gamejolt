<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import { formatNumber } from '../../../../../_common/filters/number';
import AppGraph from '../../../../../_common/graph/AppGraph.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppAnalyticsReportUserModel from './AppAnalyticsReportUserModel.vue';

defineProps({
	reportData: {
		type: Object,
		required: true,
	},
});

function isScalarLabel(val: any) {
	return typeof val.label !== 'object';
}
</script>

<template>
	<div>
		<!--
		If graph data is null, then don't show the graph and give more space for
		the table.
		-->
		<div :class="reportData.graph !== null ? 'col-sm-8' : 'col-xs-12'">
			<div v-if="!reportData.hasData" class="alert">
				<AppTranslate>No data yet.</AppTranslate>
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
							<template v-else-if="val.label.isAnalyticsEntry">
								<RouterLink
									:to="{
										name: 'dash.analytics',
										params: {
											resource: val.label.resource,
											resourceId: val.label.resourceId,
										},
									}"
								>
									{{ val.label.value }}
								</RouterLink>
							</template>
							<template v-else>
								<template v-if="val.label.resource === 'User'">
									<AppAnalyticsReportUserModel :user="val.label.gathers.user" />
								</template>
								<template v-else-if="val.label.resource === 'Fireside_Post'">
									<RouterLink :to="val.label.gathers.post.routeLocation">
										{{ val.label.value }}
									</RouterLink>
								</template>
							</template>
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
			<AppGraph type="doughnut" :dataset="reportData.graph" />
		</div>
	</div>
</template>

<style lang="stylus" src="./report-percentage.styl" scoped></style>
