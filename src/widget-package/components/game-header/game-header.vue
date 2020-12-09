<script lang="ts" src="./game-header"></script>

<template>
	<div class="-game-header">
		<app-pricing-card />

		<a
			v-app-tooltip="`View on Game Jolt`"
			class="-product-thumb"
			target="_blank"
			:href="gameUrl"
		>
			<img class="-product-thumb-img img-responsive" alt="" :src="game.img_thumbnail" />
		</a>

		<div class="-product-info">
			<div class="-title" :title="sellable.title">
				{{ sellable.title }}
			</div>

			<div class="-dev text-muted">
				by
				<a class="link-muted" target="_blank" :href="developerUrl">
					{{ developer.display_name }}
				</a>
			</div>

			<div class="text-muted">
				<span
					v-for="supportKey of packageCard.platformSupport"
					:key="supportKey"
					v-app-tooltip.touchable="packageCard.platformSupportInfo[supportKey].tooltip"
				>
					<app-jolticon :icon="packageCard.platformSupportInfo[supportKey].icon" />
				</span>

				<span v-if="shouldShowIncluded" class="-included-link">
					(<a class="link-help" @click="isShowingIncluded = true">what's included?</a>)
				</span>
			</div>
		</div>

		<app-modal v-if="isShowingIncluded" @close="isShowingIncluded = false">
			<app-included-items />
		</app-modal>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-game-header
	clearfix()
	margin-bottom: $grid-gutter-width

.-product-thumb
	display: none

	@media $media-sm-up
		display: block
		float: left
		width: $thumbnail-width

	&-img
		rounded-corners()

.-product-info
	@media $media-sm-up
		margin-left: $thumbnail-width + $grid-gutter-width

.-title
	text-overflow()
	margin-right: 15px
	font-weight: bold
	font-size: $font-size-large

.-dev
	margin-bottom: 5px
	font-family: $font-family-base

.-included-link
	user-select: none
</style>
