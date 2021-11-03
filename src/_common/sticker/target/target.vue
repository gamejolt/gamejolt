<script lang="ts" src="./target"></script>

<template>
	<app-scroll-inview
		:config="InviewConfig"
		class="sticker-target"
		@inview="onInview"
		@outview="onOutview"
	>
		<transition name="-fade">
			<div
				v-if="isShowingStickers"
				:class="{
					'-faded': drawerStore.isDrawerOpen,
				}"
			>
				<app-sticker
					v-for="sticker of stickers"
					:key="sticker.id"
					class="-sticker -sticker-animate"
					:style="{ 'animation-delay': getStickerAnimationDelay(sticker) }"
					:sticker="sticker"
					:controller="controller"
					:is-clickable="!controller.isLive"
				/>
			</div>
		</transition>

		<slot />
	</app-scroll-inview>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.sticker-target
	position: relative
	// Needs to be lower than the z-index of elements we want above the stickers.
	z-index: 0

.-sticker
	transition: filter 1s !important

	.-faded > &
		filter: grayscale(1) opacity(0.6)

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
