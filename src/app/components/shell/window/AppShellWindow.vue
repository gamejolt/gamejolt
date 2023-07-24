<script lang="ts" setup>
import { CSSProperties, PropType, computed } from 'vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { buildCSSPixelValue, kBorderRadiusLg } from '../../../../_styles/variables';

defineProps({
	/**
	 * Function that causes the window to close.
	 */
	closeCallback: {
		type: Function as PropType<() => void>,
		required: true,
	},
	/**
	 * The breakpoint at which the window should resize to avoid covering the
	 * cbar + sidebar.
	 */
	avoidSidebar: {
		type: String as PropType<'sm-up' | 'md-up'>,
		required: true,
		validator: val => typeof val === 'string' && ['sm-up', 'md-up'].includes(val),
	},
});

const zeroPx = buildCSSPixelValue(0);
const windowBorderRadius = computed(() => {
	if (Screen.isXs) {
		return zeroPx;
	}

	return kBorderRadiusLg;
});

const closeStyles: CSSProperties = {
	position: `absolute`,
	top: 0,
	right: 0,
	bottom: 0,
	left: 0,
	background: `transparent`,
	zIndex: 0,
};
</script>

<template>
	<div
		class="AppShellWindow"
		:class="{
			'_resize-sm-up': avoidSidebar === 'sm-up',
			'_resize-md-up': avoidSidebar === 'md-up',
		}"
	>
		<!-- We sadly need the close thing twice. It takes up the empty
		background space so you can click that to close the window. -->
		<div :style="closeStyles" @click="closeCallback" />
		<div
			class="_window"
			:style="{
				borderRadius: windowBorderRadius.px,
			}"
		>
			<div :style="closeStyles" @click="closeCallback" />

			<slot
				v-bind="{
					borderRadius: windowBorderRadius,
				}"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.AppShellWindow
	position: fixed
	display: flex
	justify-content: center
	align-items: flex-start
	z-index: $zindex-shell-window
	padding: 16px 20px 16px 16px
	top: 0
	left: 0
	right: 0
	bottom: 0

	&._resize-sm-up
		@media $media-sm-up
			top: var(--shell-top)
			left: calc(var(--shell-content-sidebar-width) + var(--shell-cbar-width))

	&._resize-md-up
		@media $media-md-up
			top: var(--shell-top)
			left: calc(var(--shell-content-sidebar-width) + var(--shell-cbar-width))

._window
	change-bg(bg)
	position: relative
	display: flex
	flex: auto
	justify-content: center
	width: 100%
	height: 100%
	z-index: 1
	overflow: hidden

	@media $media-xs
		position: fixed
		top: 0
		right: 0
		left: 0
		bottom: 0
		height: auto !important
		width: auto !important
</style>
