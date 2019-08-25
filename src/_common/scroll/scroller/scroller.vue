<template>
	<div
		class="scroll-scroller"
		:class="{
			'-horizontal': horizontal,
			'-hide-scrollbar': hideScrollbar,
			'-overlay': shouldOverlay,
		}"
	>
		<template v-if="shouldOverlay">
			<div class="simplebar-scroll-content">
				<div class="simplebar-content">
					<app-scroll-inview-parent
						v-if="isMounted"
						:container="_inviewContainer"
						:velocity="inviewVelocity"
						:throttle="inviewThrottle"
					>
						<slot />
					</app-scroll-inview-parent>
				</div>
			</div>
		</template>
		<template v-else>
			<app-scroll-inview-parent
				v-if="isMounted"
				:container="_inviewContainer"
				:velocity="inviewVelocity"
				:throttle="inviewThrottle"
			>
				<slot />
			</app-scroll-inview-parent>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$-track-padding = 3px
$-thumb-width = 9px
$-track-width = $-thumb-width + ($-track-padding * 2)
$-thumb-border-radius = $-track-width

// If we set the scroller to overlay, simplebar will set the overflow to hidden. By default we want
// it scrollable.
.scroll-scroller
	scrollable()

	&.-horizontal
		scrollable-x()

	>>>
		.simplebar-scrollbar:before
			change-bg('light')

		// SUPER HACK!
		// This is because simplebar sets the track to "visibility: hidden" in the
		// style attribute if it shouldn't show the track at all, but it sets the scrollbar thumb to
		// visible. According to CSS if you have a "visible" inside a "hidden" it will still show the
		// inner one as visible.
		// I believe when this is done (https://github.com/Grsmto/simplebar/issues/121) we can remove.
		.simplebar-track[style*='hidden']
			.simplebar-scrollbar
				visibility: hidden !important

.-hide-scrollbar >>> .simplebar-track
	display: none
</style>

<script lang="ts" src="./scroller"></script>
