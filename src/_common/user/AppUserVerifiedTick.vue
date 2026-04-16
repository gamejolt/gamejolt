<script lang="ts" setup>
import { computed } from 'vue';

import AppJolticon from '../jolticon/AppJolticon.vue';
import { vAppTooltip } from '../tooltip/tooltip-directive';
import { $gettext } from '../translate/translate.service';
import AppUserCreatorBadge from './creator/AppUserCreatorBadge.vue';
import { UserCommonFields } from './user.model';

type Props = {
	user: UserCommonFields;
	highlight?: boolean;
	big?: boolean;
	small?: boolean;
	tiny?: boolean;
	verticalAlign?: boolean;
};
const {
	user,
	highlight = false,
	big = false,
	small = false,
	tiny = false,
	verticalAlign = false,
} = defineProps<Props>();

const isVerified = computed(() => user.is_verified);
const icon = computed(() => (isVerified.value ? 'verified' : undefined));
const tooltip = computed(() => (isVerified.value ? $gettext(`Verified account`) : undefined));
</script>

<template>
	<AppUserCreatorBadge
		v-if="user.is_creator"
		:size="big ? 'lg' : small ? 'sm' : tiny ? 'tiny' : 'md'"
	/>
	<AppJolticon
		v-else-if="isVerified"
		v-app-tooltip="tooltip"
		:class="{
			'-highlight': highlight,
			'-vertical-align': verticalAlign,
			'-small': small,
			'-tiny': tiny,
		}"
		:icon="icon!"
		:big="big"
	/>
</template>

<style lang="stylus" scoped>
$jolticon-size = 16px

.-vertical-align
	vertical-align: middle

.-highlight
	theme-prop('color', 'highlight')

.-small
	margin: 0 2px
	font-size: $jolticon-size * 0.85

.-tiny
	margin: 0
	font-size: $jolticon-size * 0.7
</style>
