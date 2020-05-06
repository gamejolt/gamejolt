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
$-scroll-width = 6px
$-thumb-radius = $-scroll-width / 2
$-thumb-color = var(--theme-light)

.scroll-scroller
	scrollable()
	// Firefox styling
	scrollbar-color: $-thumb-color transparent

	// Other browser styling - track
	&::-webkit-scrollbar
		background-color: transparent

		// thumb-bar
		&-thumb
			background-color: $-thumb-color

	&.-horizontal
		scrollable-x()

	&.-thin
		scrollbar-width: thin

		&::-webkit-scrollbar
			width: $-scroll-width
			height: $-scroll-width

			&-thumb
				border-radius: $-thumb-radius

	&.-hide-scrollbar
		scrollbar-width: none

		&::-webkit-scrollbar
			display: none

	// Making sure that we don't have transparency issues with the track in modals
	&.modal
		scrollbar-color: $-thumb-color var(--theme-darkest)

		&::-webkit-scrollbar
			background-color: var(--theme-darkest)
</style>

<script lang="ts" src="./scroller"></script>
