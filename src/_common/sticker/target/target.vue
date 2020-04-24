<template>
	<div class="-sticker-target">
		<template v-if="showStickers">
			<app-sticker
				v-for="sticker of sorted"
				:key="sticker.id"
				:class="{ '-sticker-animate': !noAnimateIn }"
				:style="{ 'animation-delay': getStickerAnimationDelay(sticker) }"
				:sticker="sticker"
				@remove="onStickerRemoved"
			/>
		</template>
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.-sticker-target
	position: relative

.-sticker-animate
	animation-name: sticker-animate-in
	animation-duration: 0.5s
	animation-fill-mode: forwards
	opacity: 0

@keyframes sticker-animate-in
	0%
		opacity: 0
	100%
		opacity: 1
</style>

<script lang="ts" src="./target"></script>
