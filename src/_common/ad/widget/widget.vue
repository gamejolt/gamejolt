<template>
	<div
		v-if="shouldShow"
		class="-container"
		:class="{
			'-size-leaderboard': size === 'leaderboard',
			'-size-rectangle': size === 'rectangle',
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
	margin: 0 auto

.-size-leaderboard
	.-inner
		min-height: 90px

.-size-rectangle
	.-inner
		min-height: 250px
</style>

<script lang="ts" src="./widget"></script>
