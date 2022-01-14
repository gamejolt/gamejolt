<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Environment } from '../../../_common/environment/environment.service';
import { Sellable } from '../../../_common/sellable/sellable.model';
import { AppTooltip } from '../../../_common/tooltip/tooltip-directive';
import { Store } from '../../store/index';
import AppIncludedItems from '../included-items/included-items.vue';
import AppModal from '../modal/modal.vue';
import AppPricingCard from '../pricing-card/pricing-card.vue';

@Options({
	components: {
		AppPricingCard,
		AppModal,
		AppIncludedItems,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppGameHeader extends Vue {
	@State game!: Store['game'];
	@State developer!: Store['developer'];
	@State sellable!: Store['sellable'];
	@State packageCard!: Store['packageCard'];

	isShowingIncluded = false;

	get gameUrl() {
		// `https://gamejolt.com/games/${game.slug}/${game.id}`
		return Environment.baseUrl + this.game.getUrl();
	}

	get developerUrl() {
		return this.developer.web_site || Environment.baseUrl + this.developer.url;
	}

	get shouldShowIncluded() {
		return this.sellable.type !== Sellable.TYPE_FREE;
	}
}
</script>

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

		<transition>
			<app-modal v-if="isShowingIncluded" @close="isShowingIncluded = false">
				<app-included-items />
			</app-modal>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
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
