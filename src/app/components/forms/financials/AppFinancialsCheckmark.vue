<script lang="ts" setup>
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { kThemeLink } from '~common/theme/variables';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';

type Props = {
	tooltip?: string;
};
defineProps<Props>();
</script>

<template>
	<span v-app-tooltip="tooltip" :style="{ float: `right`, color: kThemeLink }">
		<AppJolticon icon="check" big />
	</span>
</template>
