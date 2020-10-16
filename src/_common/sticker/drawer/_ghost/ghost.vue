<script lang="ts" src="./ghost"></script>

<template>
	<div class="sticker-ghost" :class="itemClasses" @click.stop @contextmenu.prevent>
		<div class="-img-outer" @mousedown="onStartDrag" @touchstart="onStartDrag">
			<img
				class="-img-inner"
				draggable="false"
				style="user-drag: none"
				:style="itemStyling"
				:src="sticker.img_url"
				@dragstart.prevent
			/>
		</div>
		<transition name="-fade">
			<div v-if="shouldShowStickerControls" class="-controls" :style="controlsStyling">
				<app-button
					icon="check"
					primary
					solid
					sparse
					circle
					@click.capture="onConfirmPlacement"
				/>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-uncommitted
	filter: drop-shadow(2px 2px 2.5px black)

.-dragging
	filter: drop-shadow(4px 4px 5px black)
	pointer-events: none
	animation-name: sticker-dragging-rotate
	animation-duration: 2s
	animation-iteration-count: infinite

.sticker-ghost
	position: absolute
	cursor: grab
	touch-action: none

.-img
	&-outer
		z-index: 2

	&-inner
		display: block
		user-select: none
		width: 100%
		height: 100%
		filter: drop-shadow(2px 2px 0 white) drop-shadow(-2px 2px 0 white) drop-shadow(2px -2px 0 white) drop-shadow(-2px -2px 0 white)

.-fade
	&-enter-active
		transition: opacity 250ms $strong-ease-out

	&-enter
		opacity: 0

	&-enter-to
		opacity: 1

.-controls
	rounded-corners()
	display: flex
	justify-content: center
	align-items: center
	position: absolute
	top: calc(100% + 8px)
	z-index: 1

@keyframes sticker-dragging-rotate
	0%
		transform: none

	33%
		transform: rotateZ(25deg)

	66%
		transform: rotateZ(-25deg)

	100%
		transform: none
</style>
