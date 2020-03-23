<template>
	<div>
		<section class="section">
			<div class="container">
				<h2 class="section-header" :class="{ h4: Screen.isXs }">
					<translate>Collect more Stickers</translate>
				</h2>

				<p>
					<translate>Progress towards your next sticker:</translate>
				</p>

				<app-progress-bar class="-progress" :percent="stickerProgress" />

				<template v-if="stickersBuyableAmount > 0">
					<p>
						<translate
							:translate-n="stickersBuyableAmount"
							:translate-params="{ count: number(stickersBuyableAmount) }"
							translate-plural="You can collect %{ count } new stickers!"
						>
							You can collect %{ count } new sticker!
						</translate>
					</p>
					<router-link :to="{ name: 'dash.stickers.collect' }">
						<app-button>
							<translate>Collect</translate>
						</app-button>
					</router-link>
				</template>
			</div>
		</section>
		<section class="section">
			<div class="container">
				<h2 class="section-header" :class="{ h4: Screen.isXs }">
					<translate>Sticker Collection</translate>
				</h2>

				<div v-if="hasStickersInCollection" class="-collection">
					<app-sticker-card
						v-for="stickerCount of stickerCollection"
						:key="stickerCount.sticker_id"
						:sticker="stickerCount.sticker"
						:count="stickerCount.count"
					/>
				</div>
				<div v-else class="help-block">
					<translate>You don't have any stickers yet.</translate>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.-progress
	max-width: 350px

.-collection
	display: flex
	flex-wrap: wrap

	& > div
		margin: 10px
</style>

<script lang="ts" src="./overview"></script>
