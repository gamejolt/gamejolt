<script lang="ts" src="./app-buttons"></script>

<template>
	<div class="app-buttons" :class="{ '-justified': justified }">
		<a
			class="-button"
			:href="appPromotion.playStoreUrl"
			target="_blank"
			@click="trackAppPromotionClick({ source, platform: 'mobile' })"
		>
			<img
				:src="playStoreImage"
				:width="564 * (50 / 168)"
				:height="50"
				alt="Get it on Google Play"
			/>
		</a>
		<a
			class="-button"
			:href="appPromotion.appStoreUrl"
			target="_blank"
			@click="trackAppPromotionClick({ source, platform: 'mobile' })"
		>
			<img
				:src="appStoreImage"
				:width="120 * (50 / 40)"
				:height="50"
				alt="Download on the App Store"
			/>
		</a>
	</div>
</template>

<style lang="stylus" scoped>
.app-buttons
	display: flex
	flex-direction: row
	align-items: center
	justify-content: center
	grid-gap: 15px

	&.-justified
		justify-content: space-between

	.-button
		display: block
		flex: none
</style>
