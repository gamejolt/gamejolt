<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import { formatFuzzynumberOverThreshold } from '../../../../../_common/filters/fuzzynumber';
import { formatNumber } from '../../../../../_common/filters/number';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ProfileStat } from './AppProfileStats.vue';

type Props = {
	item: ProfileStat;
	tag?: string;
};
const { item, tag = 'div' } = defineProps<Props>();

const displayData = computed(() => {
	const { value, fuzzyThreshold } = item;
	if (fuzzyThreshold && value >= fuzzyThreshold) {
		return {
			value: formatFuzzynumberOverThreshold(value, fuzzyThreshold),
			tooltip: formatNumber(value),
		};
	}

	return { value: formatNumber(value) };
});
</script>

<template>
	<component
		:is="item.location ? RouterLink : item.action ? 'a' : tag"
		class="stat-big stat-big-smaller text-center"
		:class="{
			'link-unstyled': item.location || item.action,
		}"
		:style="{
			flex: 1,
			marginBottom: 0,
		}"
		:to="item.location"
		@click="item.action?.()"
	>
		<div v-app-tooltip="displayData.tooltip" class="stat-big-digit">
			{{ displayData.value }}
		</div>
		<div class="stat-big-label">
			{{ item.label }}
		</div>
	</component>
</template>
