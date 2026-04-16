<script lang="ts" setup>
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { kThemeLink } from '../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';

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
