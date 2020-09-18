<script lang="ts" src="./target"></script>

<template>
	<div class="-sticker-target">
		<transition name="-fade">
			<div v-if="showStickers">
				<app-sticker
					v-for="sticker of sorted"
					:key="sticker.id"
					:class="{ '-sticker-animate': !noAnimateIn }"
					:style="{ 'animation-delay': getStickerAnimationDelay(sticker) }"
					:sticker="sticker"
					@remove-all="onStickersRemoved"
				/>
			</div>
		</transition>

		<slot />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-sticker-target
	position: relative
	// Needs to be lower than the z-index of elements we want above the stickers.
	z-index: 0

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
