<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Environment } from '../../_common/environment/environment.service';
import AppJolticon from '../../_common/jolticon/AppJolticon.vue';
import { SellableType } from '../../_common/sellable/sellable.model';
import { vAppTooltip } from '../../_common/tooltip/tooltip-directive';
import { useWidgetPackageStore } from '../store/index';
import AppIncludedItems from './AppIncludedItems.vue';
import AppPricingCard from './AppPricingCard.vue';
import AppWidgetModal from './AppWidgetModal.vue';

const store = useWidgetPackageStore();

const game = computed(() => store.game.value!);
const developer = computed(() => store.developer.value!);
const sellable = computed(() => store.sellable.value!);
const packageCard = computed(() => store.packageCard.value!);

const isShowingIncluded = ref(false);

const gameUrl = computed(() => Environment.baseUrl + game.value.getUrl());
const developerUrl = computed(
	() => developer.value.web_site || Environment.baseUrl + developer.value.url
);
const shouldShowIncluded = computed(() => sellable.value.type !== SellableType.Free);
</script>

<template>
	<div class="-game-header">
		<AppPricingCard />

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
					<AppJolticon :icon="packageCard.platformSupportInfo[supportKey].icon" />
				</span>

				<span v-if="shouldShowIncluded" class="-included-link">
					(<a class="link-help" @click="isShowingIncluded = true">what's included?</a>)
				</span>
			</div>
		</div>

		<transition>
			<AppWidgetModal v-if="isShowingIncluded" @close="isShowingIncluded = false">
				<AppIncludedItems />
			</AppWidgetModal>
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
