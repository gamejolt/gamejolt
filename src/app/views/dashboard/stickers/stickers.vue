<template>
	<div>
		<app-page-header>
			<h1 class="section-header sans-margin-bottom">
				<translate>Your Stickers</translate>
			</h1>
			<div class="text-muted small">
				<p>
					<translate>
						Your place to marvel at your sticker collection and get even more stickers.
					</translate>
				</p>
			</div>
		</app-page-header>

		<template v-if="!isOpening">
			<section class="section">
				<div class="container">
					<h2 class="section-header" :class="{ h4: Screen.isXs }">
						<translate>Get more stickers</translate>
					</h2>

					<app-progress-bar :percent="stickerProgress">
						<translate>Progress to next Sticker</translate>
					</app-progress-bar>

					<translate
						:translate-n="stickersBuyableAmount"
						:translate-params="{ count: number(stickersBuyableAmount) }"
						translate-plural="You can acquire %{ count } stickers"
					>
						You can acquire 1 sticker
					</translate>

					<app-button @click="onPurchaseStickers">Acquire</app-button>
				</div>
			</section>
			<section class="section">
				<div class="container">
					<h2 class="section-header" :class="{ h4: Screen.isXs }">
						<translate>Sticker Collection</translate>
					</h2>

					<div class="-sticker-collection">
						<div
							v-for="stickerCount in stickerCollection"
							:key="stickerCount.sticker_id"
							class="-collection-sticker"
						>
							<img :src="stickerCount.sticker.media_item.mediaserver_url" />
							<div>x{{ stickerCount.count }}</div>
							<div
								class="-sticker-rarity"
								:class="{
									'-sticker-rarity-uncommon': stickerCount.sticker.rarity === 1,
									'-sticker-rarity-rare': stickerCount.sticker.rarity === 2,
									'-sticker-rarity-epic': stickerCount.sticker.rarity === 3,
								}"
								:title="getStickerRarityLabel(stickerCount.sticker.rarity)"
							>
								{{ stickerCount.sticker.name }}
							</div>
						</div>
					</div>
				</div>
			</section>
		</template>
		<template v-else>
			<section class="section">
				<div class="container">
					<template v-if="isPurchasing">
						<app-loading :label="$gettext(`Purchasing...`)" />
						<div class="-purchasing-padding"></div>
					</template>
					<template v-else>
						<div class="-sticker-container">
							<div
								v-for="purchasedSticker of purchasedStickers"
								:key="purchasedSticker.id"
								class="-sticker"
								:class="{
									'-sticker-hidden': !purchasedSticker.revealed,
									'-sticker-hidden-rarity-common':
										!purchasedSticker.revealed &&
										purchasedSticker.sticker.rarity === 0,
									'-sticker-hidden-rarity-uncommon':
										!purchasedSticker.revealed &&
										purchasedSticker.sticker.rarity === 1,
									'-sticker-hidden-rarity-rare':
										!purchasedSticker.revealed &&
										purchasedSticker.sticker.rarity === 2,
									'-sticker-hidden-rarity-epic':
										!purchasedSticker.revealed &&
										purchasedSticker.sticker.rarity === 3,
								}"
								@click="onClickRevealSticker(purchasedSticker.id)"
							>
								<img :src="purchasedSticker.sticker.media_item.mediaserver_url" />
								<template v-if="purchasedSticker.revealed">
									<div class="-sticker-name">
										{{ purchasedSticker.sticker.name }}
									</div>
									<div
										class="-sticker-rarity"
										:class="{
											'-sticker-rarity-uncommon':
												purchasedSticker.sticker.rarity === 1,
											'-sticker-rarity-rare':
												purchasedSticker.sticker.rarity === 2,
											'-sticker-rarity-epic':
												purchasedSticker.sticker.rarity === 3,
										}"
									>
										{{ getStickerRarityLabel(purchasedSticker.sticker.rarity) }}
									</div>
								</template>
							</div>
						</div>

						<div v-if="canCollect" class="-collect">
							<app-button primary @click="onClickCollect" :disabled="isRefreshing">
								<translate>Collect</translate>
							</app-button>
						</div>
					</template>
				</div>
			</section>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-purchasing-padding
	margin-bottom: 100px

.-sticker-container
	display: flex
	justify-content: space-around
	position: relative
	margin-bottom: 32px

.-sticker
	width: 25%
	max-width: 200px
	display: flex
	flex-direction: column
	align-items: center

	& > img
		transition: filter 0.2s, transform 0.2s ease
		display: block
		width: 100%

$glowwidth = 20px
$glowColorCommon = #6f6f6f
$glowColorUncommon = #1bb804
$glowColorRare = #1868f2
$glowColorEpic = #ffbc56

$glowFilterCommon = drop-shadow(0 0 $glowwidth $glowColorCommon)
$glowFilterUncommon = drop-shadow(0 0 $glowwidth $glowColorUncommon)
$glowFilterRare = drop-shadow(0 0 $glowwidth $glowColorRare)
$glowFilterEpic = drop-shadow(0 0 $glowwidth $glowColorEpic)

.-sticker-hidden-rarity
	&-common
		& > img:hover, & > img:active
			filter: brightness(0) $glowFilterCommon
	&-uncommon
		& > img:hover, & > img:active
			filter: brightness(0) $glowFilterUncommon
	&-rare
		& > img:hover, & > img:active
			filter: brightness(0) $glowFilterRare
	&-epic
		& > img:hover, & > img:active
			filter: brightness(0) $glowFilterEpic

$hiddenTransformRotate = rotate3d(0, 1, 0, -180deg)

.-sticker-hidden
	& > img
		cursor: pointer
		transform: $hiddenTransformRotate
		filter: brightness(0)

		&:hover
			transform: $hiddenTransformRotate scale(1.1)

		&:active
			transform: $hiddenTransformRotate scale(0.9)

.-sticker-name
	text-align: center
	margin-top: 10px
	font-weight: bold

.-sticker-rarity
	change-bg('bg-offset')
	padding: 4px
	font-weight: bold
	rounded-corners()
	display: inline-block

	&-uncommon
		color: #1bb804
	&-rare
		color: #18a5f2
	&-epic
		color: $glowColorEpic

.-collect
	display: flex
	justify-content: center

.-sticker-collection
	display: flex
	flex-wrap: wrap

.-collection-sticker
	margin: 10px
	width: 120px
	height: 150px
	padding: 6px
	change-bg('bg-offset')
	rounded-corners-lg()
	display: flex
	flex-direction: column
	align-items: center

	&:hover
		elevate-1()

	& > img
		display: block
		width: 64px

	&-name
		text-align: center
		font-weight: bold
</style>

<script lang="ts" src="./stickers"></script>
