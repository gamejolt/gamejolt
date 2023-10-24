<script lang="ts" setup>
import { formatCurrency, formatGemsCurrency } from '../../../../../_common/filters/currency';
import { formatNumber } from '../../../../../_common/filters/number';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';

defineProps({
	reportData: {
		type: Object,
		required: true,
	},
});
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
					<AppJolticon icon="gem" class="-gem-icon" />
					{{ formatGemsCurrency(reportData.data) }}
				</template>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-gem-icon
	color: $gj-blue
</style>
