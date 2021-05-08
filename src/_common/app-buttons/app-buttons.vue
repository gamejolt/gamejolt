<script lang="ts" src="./app-buttons"></script>

<template>
	<div class="app-buttons">
		<a
			class="-button"
			href="https://play.google.com/store/apps/details?id=com.gamejolt.app&amp;utm_source=site&amp;utm_campaign=landing&amp;pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
			target="_blank"
		>
			<img
				src="./button-play-store.png"
				:width="564 * (60 / 168)"
				:height="60"
				alt="Get it on Google Play"
			/>
		</a>
		<a class="-button" href="https://testflight.apple.com/join/JdCeNWsX" target="_blank">
			<img
				src="./button-app-store.svg"
				:width="120 * (60 / 40)"
				:height="60"
				alt="Download on the App Store"
			/>
		</a>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.app-buttons
	text-align: center

	.-button
		display: inline-block
		margin: 10px 20px
</style>
