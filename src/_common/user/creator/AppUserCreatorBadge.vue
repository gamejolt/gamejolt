<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import type { ChatUser } from '../../../app/components/chat/user';
import { imagePartnerBadge } from '../../../app/img/images';
import { configChargedStickers } from '../../config/config.service';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { $gettext } from '../../translate/translate.service';
import { User } from '../user.model';

const props = defineProps({
	user: {
		type: Object as PropType<User | ChatUser>,
		required: true,
	},
	big: {
		type: Boolean,
	},
	small: {
		type: Boolean,
	},
});

const { user, big, small } = toRefs(props);

const shouldShow = computed(() => isCreator.value);

const isCreator = computed(() => {
	if (!configChargedStickers.value) {
		return false;
	}

	return user.value.is_creator === true;
});

const tooltip = computed(() => {
	if (isCreator.value) {
		return $gettext('Game Jolt Creator');
	}
});
</script>

<template>
	<img
		v-if="shouldShow"
		v-app-tooltip="tooltip"
		class="user-creator-badge"
		:class="{
			'-big': big,
			'-small': small,
		}"
		:src="imagePartnerBadge"
	/>
</template>

<style lang="stylus" scoped>
$jolticon-size = 16px

.user-creator-badge
	display: inline-block
	margin: 0 2px
	width: $jolticon-size
	height: @width

	&.-big
		margin: 0 4px
		width: $jolticon-size * 2
		height: @width

	&.-small
		width: $jolticon-size * 0.85
		height: @width
</style>
