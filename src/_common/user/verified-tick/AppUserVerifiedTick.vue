<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import type { ChatUser } from '../../../app/components/chat/user';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { $gettext } from '../../translate/translate.service';
import AppUserCreatorBadge from '../creator/AppUserCreatorBadge.vue';
import { User } from '../user.model';

const props = defineProps({
	user: {
		type: Object as PropType<User | ChatUser>,
		required: true,
	},
	highlight: {
		type: Boolean,
	},
	big: {
		type: Boolean,
	},
	small: {
		type: Boolean,
	},
	tiny: {
		type: Boolean,
	},
	verticalAlign: {
		type: Boolean,
	},
});

const { user, highlight, big, small, verticalAlign } = toRefs(props);

const isVerified = computed(() => user.value.is_verified);
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
