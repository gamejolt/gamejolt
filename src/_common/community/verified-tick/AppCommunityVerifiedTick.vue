<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { $gettext } from '../../translate/translate.service';
import { CommunityModel } from '../community.model';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	big: { type: Boolean },
	small: { type: Boolean },
	noTooltip: { type: Boolean },
});

const { community, big, small, noTooltip } = toRefs(props);

const tooltip = computed(() => {
	if (community.value.is_verified && !noTooltip.value) {
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
