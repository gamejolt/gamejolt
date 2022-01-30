<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatCurrency } from '../../../../../_common/filters/currency';
import { formatNumber } from '../../../../../_common/filters/number';

@Options({})
export default class AppAnalyticsReportSimpleStat extends Vue {
	@Prop(Object) reportData!: any;

	readonly formatNumber = formatNumber;
	readonly formatCurrency = formatCurrency;
}
</script>

<template>
	<div class="col-sm-6 col-sm-3">
		<div class="alert" v-if="!reportData.hasData">
			<AppTranslate>No data yet.</AppTranslate>
		</div>

		<div class="stat-big" v-if="reportData.hasData">
			<div class="stat-big-label">
				{{ reportData.fieldLabel }}
			</div>
			<div class="stat-big-digit">
				<template v-if="reportData.fieldType === 'number'">
					{{ formatNumber(reportData.data) }}
				</template>
				<template v-else-if="reportData.fieldType === 'currency'">
					{{ formatCurrency(reportData.data) }}
				</template>
			</div>
		</div>
	</div>
</template>
