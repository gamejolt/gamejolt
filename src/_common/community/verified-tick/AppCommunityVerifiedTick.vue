<script lang="ts" setup>
import { computed } from 'vue';

import AppJolticon from '../../jolticon/AppJolticon.vue';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { $gettext } from '../../translate/translate.service';
import { CommunityModel } from '../community.model';

type Props = {
	community: CommunityModel;
	big?: boolean;
	small?: boolean;
	noTooltip?: boolean;
};
const { community, big, small, noTooltip } = defineProps<Props>();

const tooltip = computed(() => {
	if (community.is_verified && !noTooltip) {
		return $gettext('Verified Community');
	}
});
</script>

<template>
	<AppJolticon
		v-if="community.is_verified"
		v-app-tooltip="tooltip"
		:class="{
			'-small': small,
		}"
		icon="verified"
		:big="big"
	/>
</template>

<style lang="stylus" scoped>
$jolticon-size = 16px

.-small
	margin: 0 2px
	font-size: $jolticon-size * 0.85
</style>
