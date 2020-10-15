<script lang="ts" src="./target"></script>

<template>
	<div class="sticker-target" @mouseup="onMouseUp">
		<transition name="-fade">
			<div v-if="showStickers">
				<app-sticker
					v-for="sticker of sorted"
					:key="sticker.id"
					:class="{
						'-sticker-animate': !noAnimateIn,
						'-faded': drawerStore.isDrawerOpen,
					}"
					:style="{ 'animation-delay': getStickerAnimationDelay(sticker) }"
					:sticker="sticker"
					@click="onStickersRemoved"
				/>
			</div>
		</transition>

		<slot />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-faded
	filter: grayscale(1) opacity(0.6)
	transition: filter 1s !important

.sticker-target
	position: relative
	// Needs to be lower than the z-index of elements we want above the stickers.
	z-index: 0

	&-border
		position: absolute
		z-index: -1

.-sticker-animate
	animation-name: sticker-animate-in
	animation-duration: 0.5s
	animation-timing-function: $strong-ease-out
	animation-fill-mode: forwards
	opacity: 0

.-fade-leave
	&-active
		transition: opacity 100ms

	&-to
		opacity: 0

@keyframes sticker-animate-in
	0%
		transform: translateY(-16px)
		opacity: 0

	50%
		opacity: 1

	100%
		transform: translateY(0)
		opacity: 1
</style>
