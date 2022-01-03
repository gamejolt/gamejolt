<script lang="ts" src="./page-container"></script>

<style lang="stylus" scoped>
$-main-max-width = 650px

// Because flexbox allows the columns to flexibly size, we need to do a manual
// cut-off by setting the width forcefully. This calc line basically tries to
// find the correct width for the main content column and should work at any
// screen width since it's using calc() with the percentage.
-main-max-width($-num-columns)
	width: s('calc(100% - calc(100% / 12 * 3 * %s) - %s)', $-num-columns, ($grid-gutter-width * $-num-columns))
	max-width: $-main-max-width

// On xs the content stacks, we shove "main" to the bottom.
.-row
	display: flex
	flex-direction: column

// On mobile the left/right columns show before main.
.-left
	order: 0

.-right
	order: 1

.-main
	order: 2

// On sm we keep them in same column, but set a max size and center the content.
@media $media-sm
	.-row
		align-items: center

	.-main
	.-left
	.-right
		width: ($container-sm / 12 * 10)

// Desktop sizes is where we break it out into different columns.
@media $media-md-up
	.-row
		flex-direction: row
		justify-content: center

	.-left
		flex: 1 0
		padding-right: $grid-gutter-width
		min-width: $percentage-3
		order: 0

	.-main
		-main-max-width(1)
		flex: 2 0
		order: 1

	.-right
		flex: 1 0
		padding-left: $grid-gutter-width
		min-width: $percentage-3
		order: 2

@media $media-lg
	.-main
		-main-max-width(2)
</style>
