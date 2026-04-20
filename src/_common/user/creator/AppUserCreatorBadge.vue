<script lang="ts" setup>
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { $gettext } from '~common/translate/translate.service';
import { imagePartnerBadge } from '~img/images';

type Props = {
	size?: 'md' | 'lg' | 'sm' | 'tiny';
};
const { size = 'md' } = defineProps<Props>();
</script>

<template>
	<img
		v-app-tooltip="$gettext('Game Jolt Creator')"
		class="user-creator-badge"
		:class="{
			'-big': size === 'lg',
			'-small': size === 'sm',
			'-tiny': size === 'tiny',
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

	&.-tiny
		margin: 0
		width: $jolticon-size * 0.7
		height: @width
</style>
