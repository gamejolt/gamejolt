<template>
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
								You currently have enough points to unlock %{ count } new sticker!
							</translate>
						</p>
						<p>
							<app-button @click="onCollect">
								<translate>Unlock a Sticker</translate>
							</app-button>
						</p>
						<br />
					</template>

					<p class="small">
						<translate>
							Get more stickers by liking posts on Game Jolt. Every time you like a post, you gain
							progress to getting your next sticker. Like posts, get stickers!
						</translate>
					</p>
				</div>
				<div class="col-md-8 col-md-pull-4">
					<div v-if="hasStickersInCollection" class="-collection">
						<app-sticker-card
							v-for="stickerCount of stickerCollection"
							:key="stickerCount.sticker_id"
							:sticker="stickerCount.sticker"
							:label="`x${stickerCount.count}`"
						/>
					</div>
					<p v-else>
						<translate>You don't have any stickers yet.</translate>
					</p>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@require '../../../../../_common/sticker/card/variables'

.-progress
	max-width: 350px

.-collection
	display: grid
	grid-template-columns: repeat(auto-fill, $card-width)
	justify-content: space-between
	grid-gap: $card-margin * 2
</style>

<script lang="ts" src="./overview"></script>
