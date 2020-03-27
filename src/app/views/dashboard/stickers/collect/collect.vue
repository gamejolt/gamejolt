<template>
	<div>
		<section class="section">
			<div class="container -collect-page">
				<nav class="breadcrumb">
					<ul>
						<li>
							<router-link :to="{ name: 'dash.stickers' }">
								<span class="breadcrumb-tag">&nbsp;</span>
								<translate>Stickers</translate>
							</router-link>
							<app-jolticon icon="chevron-right" class="breadcrumb-separator" />
						</li>
						<li>
							<span class="active">
								<span class="breadcrumb-tag">&nbsp;</span>
								<translate>Collect</translate>
							</span>
						</li>
					</ul>
				</nav>

				<div class="-reveal">
					<div v-if="!canReveal">
						<app-sticker-card-hidden
							v-app-tooltip="$gettext(`Not enough credit to collect sticker`)"
						/>
					</div>
					<div v-else-if="isRevealing" class="-card-revealing-outer">
						<app-sticker-card-hidden class="-card-revealing" />
					</div>
					<template v-else-if="isRevealed && purchasedSticker">
						<div class="-card-revealed-container">
							<app-sticker-card class="-card-revealed" :sticker="purchasedSticker" />
							<div
								v-if="purchasedSticker.rarity > 0"
								class="-card-revealed-effect"
								:class="{
									'-card-revealed-effect-uncommon': purchasedSticker.rarity === 1,
									'-card-revealed-effect-rare': purchasedSticker.rarity === 2,
									'-card-revealed-effect-epic': purchasedSticker.rarity === 3,
								}"
							></div>
						</div>
						<app-expand
							:when="showCollectControls"
							:animate-initial="true"
							class="-revealed-controls"
						>
							<app-button primary @click="onClickCollect">
								<translate>Collect</translate>
							</app-button>
						</app-expand>
					</template>
					<app-sticker-card-hidden v-else @click.native="onBuySticker" class="-card-hidden" />
				</div>

				<div v-if="!canReveal">
					<div class="page-cut"></div>
					<h3 class="section-header" :class="{ h4: Screen.isXs }">
						<translate>Insufficient Credits</translate>
					</h3>
					<div class="help-block">
						<translate>
							You do not have sufficient credit to collect more stickers. Interact with Game Jolt,
							like some posts, you might get some more.
						</translate>
					</div>
					<router-link :to="{ name: 'dash.stickers' }">
						<app-button>
							<translate>View Collection</translate>
						</app-button>
					</router-link>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-collect-page
	min-height: 600px

.-reveal
	display: flex
	justify-content: center
	align-items: center
	flex-direction: column
	padding-top: 100px
	padding-bottom: 120px
	position: relative

.-card-hidden
	cursor: pointer

	&:hover
		animation: hidden-card-color 5s linear infinite alternate,
				   hidden-card-shake 0.5s linear infinite

.-card-revealing
	animation: hidden-card-shake 0.3s linear infinite,
			   card-revealing 2s linear 1 normal forwards

.-card-revealing-outer
	animation: card-outer-revealing 2s linear 1 normal forwards

.-card-revealed-outer
	position: relative

.-card-revealed-container
	position: relative
	overflow: hidden
	rounded-corners-lg()
	animation: card-revealed 0.5s linear 1 normal forwards

.-card-revealed-effect
	position: absolute
	top: 0
	width: 300%
	height: 40px
	background-color rgba(200, 200, 200, 0.5)

	&-uncommon
		animation: card-revealed-uncommon 0.5s linear 2 normal forwards
	&-rare
		animation: card-revealed-rare 0.5s linear 3 normal forwards
	&-epic
		animation: card-revealed-epic 0.5s linear 4 normal forwards

.-revealed-controls
	margin-top: 20px

$hiddenCardColorShadowSmall = 10px
$hiddenCardColorShadowLarge = 20px

@keyframes hidden-card-color
	0%
		filter: drop-shadow(0 0 $hiddenCardColorShadowSmall #1868f2)

	11%
		filter: drop-shadow(0 0 $hiddenCardColorShadowLarge #1868f2)

	22%
		filter: drop-shadow(0 0 $hiddenCardColorShadowSmall #26ddb4)

	33%
		filter: drop-shadow(0 0 $hiddenCardColorShadowLarge #26ddb4)

	44%
		filter: drop-shadow(0 0 $hiddenCardColorShadowSmall #fcee43)

	55%
		filter: drop-shadow(0 0 $hiddenCardColorShadowLarge #fcee43)

	66%
		filter: drop-shadow(0 0 $hiddenCardColorShadowSmall #fb4684)

	77%
		filter: drop-shadow(0 0 $hiddenCardColorShadowLarge #fb4684)

	88%
		filter: drop-shadow(0 0 $hiddenCardColorShadowSmall #b3b3b3)

	100%
		filter: drop-shadow(0 0 $hiddenCardHoverColorShadowLarge #b3b3b3)


@keyframes hidden-card-shake
	0%
		transform: rotate3d(0)

	33%
		transform: rotate3d(0, 0, 1, 6deg)

	66%
		transform: rotate3d(0, 0, 1, -6deg)

	100%
		transform: rotate3d(0)

@keyframes card-revealing
	0%
		filter: none

	100%
		filter: brightness(20) drop-shadow(0 0 100px #6d6d6d)

@keyframes card-outer-revealing
	0%
		transform: none

	100%
		transform: scale(1.5)

@keyframes card-revealed
	0%
		transform: scale(1.5)
		filter: brightness(20) drop-shadow(0 0 100px #6d6d6d)

	20%
		transform: scale(2)
		filter: brightness(16) drop-shadow(0 0 80px #6d6d6d)

	100%
		transform: none
		filter: none

@keyframes card-revealed-uncommon
	0%
		filter: none
		transform: rotate(-45deg) translateX(-150px) translateY(-200px)

	50%
		filter: invert(43%) sepia(97%) saturate(1525%) hue-rotate(80deg) brightness(102%) contrast(97%)

	100%
		filter: none
		transform: rotate(-45deg) translateX(-150px) translateY(90px)

@keyframes card-revealed-rare
	0%
		filter: none
		transform: rotate(-45deg) translateX(-150px) translateY(-200px)

	50%
		filter: invert(56%) sepia(28%) saturate(5236%) hue-rotate(172deg) brightness(98%) contrast(93%)

	100%
		filter: none
		transform: rotate(-45deg) translateX(-150px) translateY(90px)

@keyframes card-revealed-epic
	0%
		filter: none
		transform: rotate(-45deg) translateX(-150px) translateY(-200px)

	50%
		filter: invert(76%) sepia(99%) saturate(1337%) hue-rotate(318deg) brightness(107%) contrast(106%)

	100%
		filter: none
		transform: rotate(-45deg) translateX(-150px) translateY(90px)

</style>

<script lang="ts" src="./collect"></script>
