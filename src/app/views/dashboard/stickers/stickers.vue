<script lang="ts" src="./stickers"></script>

<template>
	<div>
		<app-page-header :cover-media-item="coverMediaItem" :cover-max-height="250">
			<router-link :to="{ name: 'dash.stickers' }">
				<h1 class="section-header sans-margin-bottom">
					<translate>Your Stickers</translate>
				</h1>
			</router-link>
			<div class="text-muted small">
				<p>
					<translate>
						Marvel at your collection of beautiful stickers.
					</translate>
				</p>
			</div>
		</app-page-header>

		<section class="section">
			<div class="container">
				<div class="row">
					<div class="col-md-4 col-md-push-8">
						<app-progress-bar class="-progress" :percent="stickerProgress">
							<strong>{{ stickerProgress }}% to next sticker</strong>
						</app-progress-bar>

						<template v-if="stickersBuyableAmount > 0">
							<p>
								<translate
									:translate-n="stickersBuyableAmount"
									:translate-params="{ count: number(stickersBuyableAmount) }"
									translate-plural="You currently have enough points to unlock %{ count } new stickers!"
								>
									You currently have enough points to unlock %{ count } new
									sticker!
								</translate>
							</p>
							<p>
								<app-button @click="onCollect">
									<translate>Unlock Stickers</translate>
								</app-button>
							</p>
							<br />
						</template>

						<p class="small">
							<translate>
								Get more stickers by liking posts on Game Jolt. Every time you like
								a post, you gain progress to getting your next sticker. Like posts,
								get stickers!
							</translate>
						</p>
					</div>
					<div class="col-md-8 col-md-pull-4">
						<template v-if="hasStickersInCollection">
							<div v-if="halloweenStickers.length">
								<div class="-candy-stickers well">
									<p>
										<b>
											Trick or Treat on Game Jolt with candy stickers!
										</b>
										During Halloween weekend, all stickers you unlock will be
										candy that you can hand out to other Game Jolt users for
										trick or treating.
									</p>
									<div class="-collection">
										<app-sticker-card
											v-for="stickerCount of halloweenStickers"
											:key="stickerCount.sticker_id"
											:sticker="stickerCount.sticker"
											:label="`x${stickerCount.count}`"
										/>
									</div>
								</div>
							</div>

							<div v-if="normalStickers.length" class="-collection">
								<app-sticker-card
									v-for="stickerCount of normalStickers"
									:key="stickerCount.sticker_id"
									:sticker="stickerCount.sticker"
									:label="`x${stickerCount.count}`"
								/>
							</div>
						</template>
						<p v-else>
							<translate>You don't have any stickers yet.</translate>
						</p>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../../../../_common/sticker/card/variables'

.-progress
	max-width: 350px

.-collection
	display: grid
	grid-template-columns: repeat(auto-fill, $card-width)
	justify-content: space-between
	grid-gap: $card-margin * 2

.-candy-stickers
	border: $border-width-large dashed var(--theme-link)
	margin-left: -($grid-gutter-width-xs / 2)
	margin-right: @margin-left

	@media $media-xs
		border-radius: 0
		border-left: 0
		border-right: 0

	@media $media-sm-up
		margin-left: -($grid-gutter-width / 2)
		margin-right: @margin-left
</style>
