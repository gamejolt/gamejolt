<template>
	<app-scroll-inview-parent
		class="scroll-scroller"
		:class="{
			'-horizontal': horizontal,
			'-hide-scrollbar': hideScrollbar,
			'-overlay': overlay,
		}"
	>
		<slot />
	</app-scroll-inview-parent>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

// 6px appears to be the width for the 'thin' scrollbar on Firefox
$-scroll-width = 6px
$-thumb-radius = $-scroll-width / 2

.scroll-scroller
	scrollable()

	&.-horizontal
		scrollable-x()

	&.-overlay
		// Firefox styling
		scrollbar-width: thin
		scrollbar-color: var(--theme-light) transparent

		// Other browser styling
		// track
		&::-webkit-scrollbar
			background-color: transparent
			width: $-scroll-width
			height: $-scroll-width

			// bar
			&-thumb
				background-color: var(--theme-light)
				border-radius: $-thumb-radius

	&.-hide-scrollbar
		// Firefox styling
		scrollbar-width: none

		// other browser styling
		&::-webkit-scrollbar
			display: none
</style>

<script lang="ts" src="./scroller"></script>
