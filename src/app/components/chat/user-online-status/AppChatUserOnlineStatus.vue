<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
	isOnline: {
		type: Boolean,
		required: true,
	},
	size: {
		type: Number,
		default: 12,
	},
	segmentWidth: {
		type: Number,
		default: 1.5,
	},
	/**
	 * The color to be displayed behind the layers of the bubble. Useful when
	 * `--theme-bg-actual` is set to something with transparency.
	 */
	backgroundColorBase: {
		type: String as PropType<'bg' | 'bg-offset'>,
		default: undefined,
	},
});
</script>

<template>
	<div
		class="user-online-status"
		:class="{
			[`-change-${backgroundColorBase}`]: !!backgroundColorBase,
		}"
		:style="{
			width: size + 'px',
			height: size + 'px',
			padding: segmentWidth + 'px',
		}"
	>
		<div class="-bg-transparency-helper" />

		<slot />

		<div
			class="-status-container"
			:class="{ '-online': isOnline, '-offline': !isOnline }"
			:style="{
				borderWidth: segmentWidth + 'px',
			}"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.user-online-status
	position: relative
	overflow: hidden

.user-online-status
.-status-container
	img-circle()

.-status-container
	position: relative
	display: flex
	justify-content: center
	align-items: center
	width: 100%
	height: 100%
	border: solid transparent

	&.-online
		background-color: var(--theme-link)

	&.-offline
		border-color: var(--theme-fg-muted)

.-bg-transparency-helper
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	background-color: var(--theme-bg-actual)

for color in bg bg-offset
	.-change-{color}
		background-color: unquote('var(--theme-' + color + ')') !important
</style>
