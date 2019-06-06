<template>
	<app-game-list-placeholder v-if="!isLoaded" :num="5" />
	<div v-else>
		<app-game-list :games="recommendedGames" event-label="recommended" />

		<template v-if="shouldShowBottomAd">
			<!-- Extra space for the page nav -->
			<app-scroll-affix :scroll-offset="80">
				<div class="-ad">
					<app-ad-playwire-video />
				</div>
			</app-scroll-affix>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-ad
	width: 300px
	margin-bottom: $line-height-computed

// Put some extra spacing in here because of the affixed game header.
.gj-scroll-affixed .-ad
	margin-top: $shell-top-nav-height + 10px !important
</style>

<script lang="ts" src="./recommended"></script>
