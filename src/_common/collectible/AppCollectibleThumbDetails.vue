<script lang="ts" setup>
import { CSSProperties, PropType, computed, onMounted, toRefs } from 'vue';
import { styleBorderRadiusBase, styleFlexCenter, styleWhen } from '../../_styles/mixins';
import { kBorderRadiusBase, kFontSizeLarge, kFontSizeSmall } from '../../_styles/variables';
import { showPurchaseShopProductModal } from '../../app/components/vending-machine/modal/_purchase-modal/modal.service';
import { isInstance } from '../../utils/utils';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import AppButton from '../button/AppButton.vue';
import { JoltydexFeed } from '../joltydex/joltydex-feed';
import AppCircularProgress from '../progress/AppCircularProgress.vue';
import AppStickerMastery from '../sticker/AppStickerMastery.vue';
import AppStickerPack, { StickerPackRatio } from '../sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '../sticker/pack/pack.model';
import { kThemeFg10, kThemeFgMuted } from '../theme/variables';
import { $gettext } from '../translate/translate.service';
import { AcquisitionMethod, filterAcquisitionMethods } from './acquisition.model';
import { CollectibleModel, CollectibleType, getCollectibleResourceId } from './collectible.model';

const props = defineProps({
	collectible: {
		type: Object as PropType<CollectibleModel>,
		required: true,
	},
	feed: {
		type: Object as PropType<JoltydexFeed>,
		required: true,
	},
});

const { collectible, feed } = toRefs(props);

onMounted(async () => {
	const packIds = filterAcquisitionMethods(
		collectible.value.acquisition,
		AcquisitionMethod.PackOpen
	).map(i => i.sticker_pack_id);

	await feed.value.loadPacks(packIds);
});

const maybePacks = computed(() => feed.value.getAcquisitionPacks(collectible.value.acquisition));

const stickerMasteryInfo = computed(() => {
	if (typeof collectible.value.sticker_mastery !== 'number') {
		return undefined;
	}

	if (collectible.value.sticker_mastery === 0) {
		return $gettext(`You haven't used this sticker yet. Use it to gain mastery!`);
	}

	if (collectible.value.sticker_mastery !== 100) {
		return $gettext(
			`Use this sticker to gain mastery. Once you master it, you'll be able to use it for emojis and reactions!`
		);
	}

	return $gettext(`You've mastered this sticker and can now use it for emojis and reactions!`);
});

const collectibleResourceAcquisition = computed(() => {
	const productType = collectible.value.type;
	if (!productType || productType === CollectibleType.Sticker) {
		return null;
	}
	// Ignore if we have no shop purchase acquisitions.
	if (collectible.value.acquisition.every(i => i.method !== AcquisitionMethod.ShopPurchase)) {
		return null;
	}
	return {
		resource: productType,
		resourceId: getCollectibleResourceId(collectible.value),
	};
});

const headingStyles = {
	textTransform: `uppercase`,
	fontSize: kFontSizeSmall.px,
	fontWeight: `bold`,
	margin: `0 0 8px 0`,
} satisfies CSSProperties;

const mutedStyles = {
	fontStyle: `italic`,
	color: kThemeFgMuted,
} satisfies CSSProperties;
</script>

<template>
	<div
		:style="{
			display: `flex`,
			flexDirection: `column`,
			gap: `16px`,
		}"
	>
		<!-- Label -->
		<div :style="{ textAlign: `center`, fontWeight: `bold`, fontSize: kFontSizeLarge.px }">
			{{ collectible.name }}
		</div>

		<!-- Image -->
		<div :style="{ width: `100%`, alignSelf: `center`, maxWidth: `200px` }">
			<AppAspectRatio :ratio="1">
				<img
					:style="[
						{
							width: `100%`,
							height: `auto`,
						},
						styleWhen(collectible.type === CollectibleType.Background, {
							borderRadius: kBorderRadiusBase.px,
						}),
					]"
					:src="collectible.image_url"
					alt=""
				/>
			</AppAspectRatio>
		</div>

		<div v-if="collectible.type === CollectibleType.Sticker">
			<h2 :style="headingStyles">
				{{ $gettext(`Mastery`) }}
			</h2>

			<template v-if="typeof collectible.sticker_mastery === 'number'">
				<div
					:style="{
						flex: `none`,
						display: `flex`,
						flexDirection: `row`,
						alignItems: `center`,
						gap: `8px`,
					}"
				>
					<div :style="{ flex: `none`, fontSize: kFontSizeSmall.px }">
						{{ collectible.sticker_mastery }}%
					</div>
					<div :style="{ flex: `auto` }">
						<AppStickerMastery :progress="collectible.sticker_mastery" />
					</div>
				</div>

				<div
					:style="[
						mutedStyles,
						{
							marginTop: `4px`,
							fontSize: kFontSizeSmall.px,
						},
					]"
				>
					{{ stickerMasteryInfo }}
				</div>
			</template>
			<div v-else :style="mutedStyles">
				{{ $gettext(`This sticker can't be mastered.`) }}
			</div>
		</div>

		<div v-if="collectible.description">
			<h2 :style="headingStyles">
				{{ $gettext(`Description`) }}
			</h2>

			<div :style="mutedStyles">
				{{ collectible.description }}
			</div>
		</div>

		<template v-if="maybePacks.length">
			<h2 :style="headingStyles">
				{{ $gettext(`Packs`) }}
			</h2>

			<div
				:style="{
					display: `grid`,
					gridTemplateColumns: `repeat(2, 1fr)`,
					gap: `8px`,
				}"
			>
				<div v-for="pack in maybePacks" :key="pack.id">
					<AppStickerPack
						v-if="isInstance(pack, StickerPackModel)"
						:pack="pack"
						show-name
						can-click-pack
						@click-pack="
							showPurchaseShopProductModal({
								resource: 'Sticker_Pack',
								resourceId: pack.id,
							})
						"
					/>
					<AppAspectRatio
						v-else
						:style="{
							...styleBorderRadiusBase,
							backgroundColor: kThemeFg10,
						}"
						:ratio="StickerPackRatio"
						:inner-styles="styleFlexCenter()"
					>
						<AppCircularProgress :style="{ width: `36px`, maxWidth: `100%` }" />
					</AppAspectRatio>
				</div>
			</div>
		</template>

		<AppButton
			v-if="collectibleResourceAcquisition"
			block
			solid
			primary
			@click="showPurchaseShopProductModal(collectibleResourceAcquisition)"
		>
			{{ $gettext(`View in shop`) }}
		</AppButton>
	</div>
</template>
