<template>
	<app-game-list-placeholder v-if="!isLoaded" :num="5" />
	<div v-else>
		<app-game-list :games="gamesBeforeAd" event-label="recommended" />

		<div v-if="shouldShowAds" class="-ad">
			<app-ad-widget size="rectangle" pos="bottom" />
		</div>

		<app-game-list v-if="gamesAfterAd.length > 0" :games="gamesAfterAd" event-label="recommended" />

		<div v-if="shouldShowAds && shouldShowBottomAd" class="-ad">
			<app-ad-widget size="rectangle" pos="bottom" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-ad
	width: 300px
	margin-bottom: $line-height-computed
</style>

<script lang="ts" src="./recommended"></script>
