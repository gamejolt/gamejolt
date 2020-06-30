<template>
	<div
		class="scroll-scroller"
		:class="{
			'-thin': thin,
			'-horizontal': horizontal,
			'-hide-scrollbar': hideScrollbar,
		}"
	>
		<app-scroll-inview-parent v-if="isMounted" :scroller="scrollElement">
			<slot />
		</app-scroll-inview-parent>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

// 6px appears to be the width for the 'thin' scrollbar on Firefox
$-size-default = 10px
$-size-thin = 6px
$-thumb-default-hover = var(--theme-light-hover)
$-thumb-default = var(--theme-light)
$-track-default = transparent
$-thumb-modal-hover = var(--theme-gray-subtle-hover)
$-thumb-modal = var(--theme-gray-subtle)
$-track-modal = var(--theme-bg)

.scroll-scroller
	scrollable()

	&.-horizontal
		scrollable-x()

	&.-hide-scrollbar
		// Firefox
		scrollbar-width: none

		// Other browsers
		&::-webkit-scrollbar
			display: none

	/* mouse, touch pad, and stylus-based screens */
	@media not screen and (pointer: coarse)
		scrollbar-color: $-thumb-default $-track-default

		&::-webkit-scrollbar
			background-color: $-track-default
			width: $-size-default
			height: $-size-default

			&-thumb
				background-color: $-thumb-default
				border-radius: $-size-default

				&:hover
					background-color: $-thumb-default-hover

		&.-thin
			scrollbar-width: thin

			&::-webkit-scrollbar
				width: $-size-thin
				height: $-size-thin

				&-thumb
					border-radius: $-size-thin

		// Override colors so transparency doesn't look weird
		// with body background or others in full-screen modals.
		&.modal
			scrollbar-color: $-thumb-modal $-track-modal

			&::-webkit-scrollbar
				background-color: $-track-modal

				&-thumb
					background-color: $-thumb-modal

					&:hover
						background-color: $-thumb-modal-hover
</style>

<script lang="ts" src="./scroller"></script>
