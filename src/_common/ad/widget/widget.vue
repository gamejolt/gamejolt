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
			<app-ad-playwire :size="size" :static-size="staticSize" />
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
		// min-width: 728px
		min-height: 90px

.-size-rectangle
	.-inner
		// min-width: 300px
		min-height: 250px
</style>

<script lang="ts" src="./widget"></script>
