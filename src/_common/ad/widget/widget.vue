<template>
	<div
		v-if="shouldShow"
		class="-container"
		:class="{
			'-size-leaderboard': adSlot.size === 'leaderboard',
			'-size-rectangle': adSlot.size === 'rectangle',
		}"
	>
		<div class="-inner">
			<app-ad-widget-inner :ad-slot="adSlot" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-container
	text-align: center

.-inner
	display: flex
	align-items: center
	justify-content: center
	margin: 0 auto

// We reserve some extra space for the "report ad" link below the ad itself.
.-size-leaderboard
	.-inner
		min-height: 115px

.-size-rectangle
	.-inner
		min-height: 275px
</style>

<script lang="ts" src="./widget"></script>
