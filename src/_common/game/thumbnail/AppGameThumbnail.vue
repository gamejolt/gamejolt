<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
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

const props = defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
	linkTo: {
		type: String,
		default: '',
	},
	hidePricing: {
		type: Boolean,
		default: false,
	},
	hideControls: {
		type: Boolean,
		default: false,
	},
});

const { linkTo, game } = toRefs(props);

const isBootstrapped = ref(import.meta.env.SSR);
const isHydrated = ref(import.meta.env.SSR);

const shouldAnimate = computed(() => SettingAnimatedThumbnails.get() && isHydrated.value);

const url = computed(() => {
	if (linkTo.value === 'dashboard') {
		return game.value.getUrl('dashboard');
	} else if (linkTo.value) {
		return linkTo.value;
	}

	return game.value.getUrl();
});

const isOwned = computed(() => game.value.sellable && game.value.sellable.is_owned);
const sellableType = computed(() => game.value.sellable && game.value.sellable.type);

const pricing = computed(() => {
	if (game.value.sellable && Array.isArray(game.value.sellable.pricings)) {
		return game.value.sellable.pricings[0];
	}
	return undefined;
});

const saleOldPricing = computed(() => {
	if (game.value.sellable && Array.isArray(game.value.sellable.pricings)) {
		return game.value.sellable.pricings[1];
	}
	return undefined;
});

const sale = computed(() => pricing.value && pricing.value.promotional);

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
			<div v-if="Screen.isLg && isHydrated" class="-controls theme-dark" @click.prevent>
				<slot />
			</div>

			<AppGameThumbnailImg
				class="-thumb"
				:game="game"
				:hide-media="!isBootstrapped"
				:animate="shouldAnimate"
			/>

			<div class="-meta">
				<div
					v-if="game._has_packages && !hidePricing"
					class="-pricing fill-offset"
					:class="{
						'-pricing-owned': isOwned,
						'-pricing-sale': sale,
					}"
				>
					<template v-if="!isOwned">
						<template v-if="sellableType === 'paid'">
							<div class="-pricing-container">
								<div v-if="sale" class="-pricing-amount-old">
									{{ oldPricingAmount }}
								</div>
								<div class="-pricing-amount">
									{{ pricingAmount }}
								</div>
							</div>
							<div v-if="sale" class="-pricing-sale-percentage">
								-{{ salePercentageOff }}%
							</div>
						</template>
						<span v-else-if="sellableType === 'pwyw'" class="-pricing-tag">
							<AppTranslate>Name Your Price</AppTranslate>
						</span>
						<span v-else class="-pricing-tag">
							<AppTranslate>Free</AppTranslate>
						</span>
					</template>
					<template v-else>
						<span class="-pricing-tag">
							<AppTranslate>Owned</AppTranslate>
						</span>
					</template>
				</div>

				<div class="-avatar">
					<AppUserCardHover :user="game.developer">
						<AppUserAvatarImg :user="game.developer" />
					</AppUserCardHover>
				</div>

				<div
					class="-dev"
					:title="`${game.developer.display_name} (@${game.developer.username})`"
				>
					{{ game.developer.display_name }}
					<small>
						<AppUserVerifiedTick :user="game.developer" vertical-align />
					</small>
				</div>

				<div class="-title" :title="game.title">
					{{ game.title }}
				</div>

				<div class="-meta-extra">
					<!-- Don't show if devlog -->
					<div v-if="game.development_status !== 4" class="-os">
						<AppGameCompatIcons :game="game" />
					</div>

					<span class="-tags">
						<span v-if="game.isUnlisted" class="-tag tag tag-notice">
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
	position: relative
	display: block
	margin-bottom: $grid-gutter-width-xs
	color: inherit

	@media $media-sm-up
		margin-bottom: $grid-gutter-width

		.-thumb
			elevate-0()

		&:hover
			.-thumb
				elevate-2()

.-controls
	position: absolute
	top: 5px
	right: 5px
	z-index: 10
	display: none

	.game-thumbnail:hover &
		display: block

.-meta
	position: relative
	padding-top: $game-thumbnail-meta-spacing

.-avatar
	float: left
	width: $game-thumbnail-avatar-size
	height: $game-thumbnail-avatar-size

.-dev
	text-overflow()
	theme-prop('color', 'fg-muted')
	margin-left: $game-thumbnail-avatar-size + $game-thumbnail-meta-spacing
	font-weight: bold
	font-size: $font-size-h6

.-title
	text-overflow()
	margin: 0
	margin-left: $game-thumbnail-avatar-size + $game-thumbnail-meta-spacing
	line-height: 1.3
	font-weight: bold

.-meta-extra
	clear: both
	margin-top: $game-thumbnail-meta-spacing
	// We show tags and icons in here. We want to make sure that the line
	// height is always the same no matter what content we show, so let's
	// force it.
	line-height: 26px

.-os
	display: inline-block
	margin-right: $game-thumbnail-meta-spacing

.-tags
	display: inline-block
	margin-right: $game-thumbnail-meta-spacing

.-pricing
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

		.-pricing
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
.-title
	theme-prop('color', 'fg')

	.game-thumbnail:hover &
		theme-prop('color', 'link')
</style>
