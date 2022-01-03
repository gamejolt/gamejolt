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
					<translate> Marvel at your collection of beautiful stickers. </translate>
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
							<div class="-collection">
								<app-sticker-card
									v-for="stickerCount of stickerCollection"
									:key="stickerCount.sticker_id"
									:sticker="stickerCount.sticker"
									:label="`x${stickerCount.count}`"
									:is-new="newStickerIds.includes(stickerCount.sticker_id)"
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
@import '../../../../_common/sticker/card/variables'

.-progress
	max-width: 350px

.-collection
	display: grid
	grid-template-columns: repeat(auto-fill, $card-width)
	justify-content: space-between
	grid-gap: $card-margin * 2
</style>
