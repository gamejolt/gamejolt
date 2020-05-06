<template>
	<div
		class="scroll-scroller"
		:class="{
			'-thin': thin,
			'-horizontal': horizontal,
			'-hide-scrollbar': hideScrollbar,
		}"
	>
		<app-scroll-inview-parent v-if="isMounted" :scroller="$el">
			<slot />
		</app-scroll-inview-parent>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

// 6px appears to be the width for the 'thin' scrollbar on Firefox
$-scrollbar-size = 6px
$-thumb-radius = $-scrollbar-size / 2
$-default-thumb = var(--theme-light)
$-default-track = transparent
$-modal-thumb = var(--dark-theme-bg-subtle)
$-modal-track = var(--theme-bg)

.scroll-scroller
	scrollable()
	// Firefox
	scrollbar-color: $-default-thumb $-default-track

	// Other browsers
	&::-webkit-scrollbar
		background-color: $-default-track

		&-thumb
			background-color: $-default-thumb

	&.-horizontal
		scrollable-x()

	&.-thin
		scrollbar-width: thin

		&::-webkit-scrollbar
			width: $-scrollbar-size
			height: $-scrollbar-size

			&-thumb
				border-radius: $-thumb-radius

	&.-hide-scrollbar
		scrollbar-width: none

		&::-webkit-scrollbar
			display: none

	// Override colors so transparency doesn't look weird
	// with body background or others in full-screen modals.
	&.modal
		scrollbar-color: $-modal-thumb $-modal-track

		&::-webkit-scrollbar
			background-color: $-modal-track

			&-thumb
				background-color: $-modal-thumb
</style>

<script lang="ts" src="./scroller"></script>
