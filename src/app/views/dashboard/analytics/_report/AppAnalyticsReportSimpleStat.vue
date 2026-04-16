<script lang="ts" setup>
import { DeepReadonly } from 'vue';

import { ReportComponent } from '~app/components/site-analytics/site-analytics-service';
import AppCurrencyImg from '~common/currency/AppCurrencyImg.vue';
import { CurrencyType } from '~common/currency/currency-type';
import { formatCurrency, formatGemsCurrency } from '~common/filters/currency';
import { formatNumber } from '~common/filters/number';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	reportData: DeepReadonly<ReportComponent>;
};
defineProps<Props>();

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
