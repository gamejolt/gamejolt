<script lang="ts">
import { computed, ref, toRef } from 'vue';
import { RouterLink } from 'vue-router';
import { formatCurrency } from '../../filters/currency';
import { Screen } from '../../screen/screen-service';
import AppScrollInview, { ScrollInviewConfig } from '../../scroll/inview/AppScrollInview.vue';
import { SettingAnimatedThumbnails } from '../../settings/settings.service';
import AppTranslate from '../../translate/AppTranslate.vue';
import AppUserVerifiedTick from '../../user/AppUserVerifiedTick.vue';
import AppUserCardHover from '../../user/card/AppUserCardHover.vue';
import AppUserAvatarImg from '../../user/user-avatar/AppUserAvatarImg.vue';
import AppGameCompatIcons from '../compat-icons/AppGameCompatIcons.vue';
import { GameModel } from '../game.model';
import AppGameThumbnailImg from './AppGameThumbnailImg.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height}px` });
</script>

<script lang="ts" setup>
type Props = {
	game: GameModel;
	linkTo?: string;
	hidePricing?: boolean;
	hideControls?: boolean;
};

const { game, linkTo = '' } = defineProps<Props>();

const isBootstrapped = ref(import.meta.env.SSR);
const isHydrated = ref(import.meta.env.SSR);

const shouldAnimate = computed(() => SettingAnimatedThumbnails.get() && isHydrated.value);

const url = computed(() => {
	if (linkTo === 'dashboard') {
		return game.getUrl('dashboard');
	} else if (linkTo) {
		return linkTo;
	}
	return game.getUrl();
});

const isOwned = toRef(() => game.sellable && game.sellable.is_owned);
const sellableType = toRef(() => game.sellable && game.sellable.type);

const pricing = toRef(() => {
	if (game.sellable && Array.isArray(game.sellable.pricings)) {
		return game.sellable.pricings[0];
	}
	return undefined;
});

const saleOldPricing = toRef(() => {
	if (game.sellable && Array.isArray(game.sellable.pricings)) {
		return game.sellable.pricings[1];
	}
	return undefined;
});

const sale = toRef(() => pricing.value && pricing.value.promotional);

const salePercentageOff = computed(() => {
	if (pricing.value && saleOldPricing.value) {
		return (
			((saleOldPricing.value.amount - pricing.value.amount) / saleOldPricing.value.amount) *
			100
		).toFixed(0);
	}
	return '';
});

const pricingAmount = computed(() => pricing.value && formatCurrency(pricing.value.amount));
const oldPricingAmount = computed(
	() => saleOldPricing.value && formatCurrency(saleOldPricing.value.amount)
);

function inView() {
	isBootstrapped.value = true;
	isHydrated.value = true;
}

function outView() {
	isHydrated.value = false;
}
</script>

<template>
	<RouterLink class="game-thumbnail" :to="url">
		<AppScrollInview :config="InviewConfig" @inview="inView" @outview="outView">
			<div v-if="Screen.isLg && isHydrated" class="_controls theme-dark" @click.prevent>
				<slot />
			</div>

			<AppGameThumbnailImg
				class="_thumb"
				:game="game"
				:hide-media="!isBootstrapped"
				:animate="shouldAnimate"
			/>

			<div class="_meta">
				<div
					v-if="game._has_packages && !hidePricing"
					class="_pricing fill-offset"
					:class="{
						'_pricing-owned': isOwned,
						'_pricing-sale': sale,
					}"
				>
					<template v-if="!isOwned">
						<template v-if="sellableType === 'paid'">
							<div class="_pricing-container">
								<div v-if="sale" class="_pricing-amount-old">
									{{ oldPricingAmount }}
								</div>
								<div class="_pricing-amount">
									{{ pricingAmount }}
								</div>
							</div>
							<div v-if="sale" class="_pricing-sale-percentage">
								-{{ salePercentageOff }}%
							</div>
						</template>
						<span v-else-if="sellableType === 'pwyw'" class="_pricing-tag">
							<AppTranslate>Name Your Price</AppTranslate>
						</span>
						<span v-else class="_pricing-tag">
							<AppTranslate>Free</AppTranslate>
						</span>
					</template>
					<template v-else>
						<span class="_pricing-tag">
							<AppTranslate>Owned</AppTranslate>
						</span>
					</template>
				</div>

				<div class="_avatar">
					<AppUserCardHover :user="game.developer">
						<AppUserAvatarImg :user="game.developer" />
					</AppUserCardHover>
				</div>

				<div
					class="_dev"
					:title="`${game.developer.display_name} (@${game.developer.username})`"
				>
					{{ game.developer.display_name }}
					<small>
						<AppUserVerifiedTick :user="game.developer" vertical-align />
					</small>
				</div>

				<div class="_title" :title="game.title">
					{{ game.title }}
				</div>

				<div class="_meta-extra">
					<!-- Don't show if devlog -->
					<div v-if="game.development_status !== 4" class="_os">
						<AppGameCompatIcons :game="game" />
					</div>

					<span class="_tags">
						<span v-if="game.isUnlisted" class="_tag tag tag-notice">
							<AppTranslate>Unlisted</AppTranslate>
						</span>
					</span>
				</div>
			</div>
		</AppScrollInview>
	</RouterLink>
</template>

<style lang="stylus" scoped>
@import './variables'

.game-thumbnail
	rounded-corners-lg()
	overflow: hidden
	position: relative
	display: block
	margin-bottom: $grid-gutter-width-xs
	color: inherit

	@media $media-sm-up
		margin-bottom: $grid-gutter-width

	elevate-0()

	&:hover
		elevate-2()

._thumb
	position: relative
	z-index: 1

._controls
	position: absolute
	top: 5px
	right: 5px
	z-index: 10
	display: none

	.game-thumbnail:hover &
		display: block

._meta
	change-bg('bg')
	margin-top: -10px
	position: relative
	padding: $game-thumbnail-meta-spacing
	padding-top: $game-thumbnail-meta-spacing + -@margin-top

._avatar
	float: left
	width: $game-thumbnail-avatar-size
	height: $game-thumbnail-avatar-size

._dev
	text-overflow()
	theme-prop('color', 'fg-muted')
	margin-left: $game-thumbnail-avatar-size + $game-thumbnail-meta-spacing
	font-weight: bold
	font-size: $font-size-h6

._title
	text-overflow()
	margin: 0
	margin-left: $game-thumbnail-avatar-size + $game-thumbnail-meta-spacing
	line-height: 1.3
	font-weight: bold

._meta-extra
	clear: both
	margin-top: $game-thumbnail-meta-spacing
	// We show tags and icons in here. We want to make sure that the line
	// height is always the same no matter what content we show, so let's
	// force it.
	line-height: 26px

._os
	display: inline-block
	margin-right: $game-thumbnail-meta-spacing

._tags
	display: inline-block
	margin-right: $game-thumbnail-meta-spacing

._pricing
	rounded-corners()
	float: right
	height: 30px
	line-height: @height
	margin-left: $game-thumbnail-meta-spacing
	padding: 0 10px
	text-align: center

	&-owned
		change-bg('highlight')
		theme-prop('color', 'highlight-fg')

		& ^[-1]-tag
			color: inherit

	&-amount
		font-size: $font-size-small
		font-weight: bold

	&-decimal
		font-size: $font-size-small

	&-tag
		theme-prop('color', 'fg')
		font-size: $font-size-tiny
		font-weight: bold
		text-transform: uppercase

	// This is way too complex.
	&-sale
		height: 36px
		line-height: @height

		._pricing
			&-sale-percentage
				change-bg('gray')
				theme-prop('color', 'highlight')
				display: inline-block
				vertical-align: top
				margin-right: -10px
				margin-left: 10px
				padding-right: 10px
				padding-left: 10px
				height: 36px
				line-height: @height
				font-size: $font-size-small
				font-weight: bold
				border-top-right-radius: $border-radius-base
				border-bottom-right-radius: $border-radius-base

			&-container
				display: inline-block
				height: 36px
				padding-top: 3px
				padding-bottom: 3px
				vertical-align: top

			&-amount
				line-height: 20px

			&-amount-old
				theme-prop('color', 'fg-muted')
				text-decoration: line-through
				font-size: $font-size-tiny
				line-height: 10px
				vertical-align: text-bottom

// Text color
._title
	theme-prop('color', 'fg')

	.game-thumbnail:hover &
		theme-prop('color', 'link')
</style>
