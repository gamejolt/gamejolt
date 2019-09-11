<template>
	<v-popover
		:id="popperId"
		ref="popover"
		:class="{
			'-block': block,
			'-ssr': GJ_IS_SSR,
		}"
		popover-base-class="popper"
		popover-wrapper-class="popper-wrapper"
		popover-arrow-class="popper-arrow"
		:popover-inner-class="popoverInnerClass"
		:placement="placement"
		:trigger="trigger"
		:delay="delay"
		:disabled="disabled"
		:open="show"
		:auto-hide="autoHide"
		:open-group="openGroup"
		@apply-show="onShow"
		@apply-hide="onHide"
		@auto-hide="onAutoHide"
	>
		<slot />
		<div
			v-if="isVisible"
			slot="popover"
			class="-container"
			:style="{
				maxHeight,
				width,
				maxWidth,
			}"
		>
			<div class="-header">
				<slot name="header" />
			</div>
			<app-scroll-scroller ref="scroller" class="-main" overlay :inview-throttle="0">
				<slot name="popover" />
			</app-scroll-scroller>
			<div class="-footer">
				<slot name="footer" />
			</div>
		</div>
	</v-popover>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-container
	display: flex
	flex-direction: column

.-header, .-footer
	flex: none

.-main
	flex: auto
</style>

<script lang="ts" src="./popper"></script>
