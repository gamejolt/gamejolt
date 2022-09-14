<script lang="ts" setup>
import { PropType } from 'vue';
import { imagePartnerBadge } from '../../../app/img/images';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { $gettext } from '../../translate/translate.service';

defineProps({
	size: {
		type: String as PropType<'md' | 'lg' | 'sm'>,
		default: 'default',
	},
});
</script>

<template>
	<img
		v-app-tooltip="$gettext('Game Jolt Creator')"
		class="user-creator-badge"
		:class="{
			'-big': size === 'lg',
			'-small': size === 'sm',
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
