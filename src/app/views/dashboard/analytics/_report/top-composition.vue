<script lang="ts" src="./top-composition"></script>

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
						<td>{{ (i + 1) | number }}.</td>
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
							{{ val.value | number }}
						</td>
						<td>
							<div
								class="report-percentage"
								:style="{ width: (val / reportData.total) * 70 + 'px' }"
							/>
							<small>
								{{
									(val.value / reportData.total)
										| number({ style: 'percent', maximumFractionDigits: 2 })
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
