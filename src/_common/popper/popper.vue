<script lang="ts" src="./popper"></script>

<template>
	<div
		:id="popperId"
		ref="trigger"
		class="popper"
		:class="{ '-block': block }"
		@click="onTriggerClicked"
		@contextmenu="onContextMenu"
		@pointerenter="onMouseEnter"
		@pointerleave="onMouseLeave"
	>
		<slot />
		<div
			v-if="isVisible"
			ref="popper"
			v-app-observe-dimensions="onDimensionsChanged"
			class="popper-wrapper"
			:class="{ '-hide': isHiding, '-ssr': GJ_IS_SSR }"
			@mouseenter="!noHoverPopover ? onMouseEnter : null"
			@mouseleave="!noHoverPopover ? onMouseLeave : null"
		>
			<div v-if="!sansArrow" class="popper-arrow" data-popper-arrow />
			<div
				class="popper-content"
				:class="contentClass"
				:style="{
					maxHeight,
					width,
					maxWidth,
				}"
			>
				<div class="-header">
					<slot name="header" />
				</div>
				<app-scroll-scroller ref="scroller" class="-main" thin>
					<slot name="popover" />
				</app-scroll-scroller>
				<div class="-footer">
					<slot name="footer" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.popper-content
	display: flex
	flex-direction: column
</style>
