<script lang="ts" src="./app-buttons"></script>

<template>
	<div class="app-buttons">
		<a
			class="-button"
			:href="appPromotion.playStoreUrl"
			target="_blank"
			@click="trackAppPromotionClick({ source })"
		>
			<img
				:src="playStoreImage"
				:width="564 * (60 / 168)"
				:height="60"
				alt="Get it on Google Play"
			/>
		</a>
		<a
			class="-button"
			:href="appPromotion.appStoreUrl"
			target="_blank"
			@click="trackAppPromotionClick({ source })"
		>
			<img
				:src="appStoreImage"
				:width="120 * (60 / 40)"
				:height="60"
				alt="Download on the App Store"
			/>
		</a>
	</div>
</template>

<style lang="stylus" scoped>
.app-buttons
	text-align: center

	.-button
		display: inline-block
		margin: 10px 20px
</style>
