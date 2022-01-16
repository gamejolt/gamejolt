<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';

@Options({})
export default class AppAnalyticsReportRatingBreakdown extends Vue {
	@Prop(Object) reportData!: any;

	readonly formatNumber = formatNumber;
}
</script>

<template>
	<div class="col-sm-8">
		<table class="table table-striped table-condensed">
			<thead>
				<tr>
					<th>
						<translate>Rating Given</translate>
					</th>
					<th class="text-right">
						<translate>Count</translate>
					</th>
					<th style="width: 150px" />
				</tr>
			</thead>
			<tbody>
				<tr v-for="i of [1, 0]" :key="i">
					<td v-if="i === 1">
						<translate>Like</translate>
					</td>
					<td v-else>
						<translate>Dislike</translate>
					</td>
					<td class="text-right">
						{{ formatNumber(reportData.data[i] || 0) }}
					</td>
					<td>
						<div
							class="report-percentage"
							:style="{
								width: ((reportData.data[i] || 0) / reportData.total) * 70 + 'px',
							}"
						/>
						<small>
							{{
								formatNumber(reportData.data[i] / reportData.total || 0, {
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
</template>

<style lang="stylus" src="./report-percentage.styl" scoped></style>
