<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import type { ChatUser } from '../../../app/components/chat/user';
import { configChargedStickers } from '../../config/config.service';
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
	verticalAlign: {
		type: Boolean,
	},
});

const { user, highlight, big, small, verticalAlign } = toRefs(props);

const isVerified = computed(() => user.value.is_verified);
const isCreator = computed(() => {
	if (!configChargedStickers.value) {
		return false;
	}

	return user.value.is_creator === true;
});

const icon = computed(() => {
	if (isVerified.value) {
		return 'verified';
	}
});

const tooltip = computed(() => {
	if (isVerified.value) {
		return $gettext(`Verified Account`);
	}
});
</script>

<template>
	<AppUserCreatorBadge v-if="isCreator" :user="user" :big="big" :small="small" />
	<AppJolticon
		v-else-if="isVerified"
		v-app-tooltip="tooltip"
		:class="{
			'-highlight': highlight,
			'-vertical-align': verticalAlign,
			'-small': small,
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
</style>
