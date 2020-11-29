<script lang="ts" src="./widget"></script>

<template>
	<div
		v-if="shouldShow"
		class="ad-widget"
		:class="{
			'-size-leaderboard': adSlot.size === 'leaderboard',
			'-size-rectangle': adSlot.size === 'rectangle',
		}"
	>
		<div class="-content">
			<app-ad-widget-inner :ad-slot="adSlot" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.ad-widget
	text-align: center

	.-content
		display: flex
		align-items: center
		justify-content: center
		margin: 0 auto

		// Make sure the ad is able to take up the full width.
		> .ad-widget-inner
			flex: auto

	// We reserve some extra space for the "report ad" link below the ad itself.
	&.-size-leaderboard
		.-content
			min-height: 115px

	&.-size-rectangle
		.-content
			min-height: 275px
</style>
