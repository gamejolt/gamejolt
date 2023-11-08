<script lang="ts" setup>
import { DeepReadonly, PropType } from 'vue';
import AppCurrencyImg from '../../../../../_common/currency/AppCurrencyImg.vue';
import { CurrencyType } from '../../../../../_common/currency/currency-type';
import { formatCurrency, formatGemsCurrency } from '../../../../../_common/filters/currency';
import { formatNumber } from '../../../../../_common/filters/number';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { ReportComponent } from '../../../../components/site-analytics/site-analytics-service';

defineProps({
	reportData: {
		type: Object as PropType<DeepReadonly<ReportComponent>>,
		required: true,
	},
});

const { gems } = CurrencyType;
</script>

<template>
	<div class="col-sm-6 col-sm-3">
		<div v-if="!reportData.hasData" class="alert">
			<AppTranslate>No data.</AppTranslate>
		</div>

		<div v-if="reportData.hasData" class="stat-big">
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
				<template v-else-if="reportData.fieldType === 'gems'">
					<AppCurrencyImg :currency="gems" />
					{{ formatGemsCurrency(reportData.data) }}
				</template>
			</div>
		</div>
	</div>
</template>
