<template>
	<div>
		<section class="section">
			<div class="container -collect-page">
				<app-sticker-collect
					:balance="balance"
					:sticker-cost="stickerCost"
					@sticker-purchase="onStickerPurchase"
				/>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>

.-collect-page
	min-height: 600px
</style>

<script lang="ts" src="./collect"></script>
