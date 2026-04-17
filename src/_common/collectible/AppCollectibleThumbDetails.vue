<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';

import { showPurchaseShopProductModal } from '~app/components/vending-machine/modal/_purchase-modal/modal.service';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '~common/button/AppButton.vue';
import { AcquisitionMethod } from '~common/collectible/acquisition.model';
import {
	CollectibleModel,
	CollectibleType,
	getCollectibleResourceId,
} from '~common/collectible/collectible.model';
import { PurchasableProductType } from '~common/inventory/shop/product-owner-helpers';
import { JoltydexFeed } from '~common/joltydex/joltydex-feed';
import AppCircularProgress from '~common/progress/AppCircularProgress.vue';
import AppStickerMastery from '~common/sticker/AppStickerMastery.vue';
import AppStickerPack, { StickerPackRatio } from '~common/sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '~common/sticker/pack/pack.model';
import { kThemeFg10, kThemeFgMuted } from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';
import { kBorderRadiusBase, kFontSizeLarge, kFontSizeSmall } from '~styles/variables';
import { isInstance } from '~utils/utils';

type Props = {
	collectible: CollectibleModel;
	feed: JoltydexFeed;
};
const { collectible, feed } = defineProps<Props>();

const maybePacks = computed(() => feed.getAcquisitionPacks(collectible.acquisition));

const stickerMasteryInfo = computed(() => {
	if (typeof collectible.sticker_mastery !== 'number') {
		return undefined;
	}

	if (collectible.sticker_mastery === 0) {
		return $gettext(`You haven't used this sticker yet. Use it to gain mastery!`);
	}

	if (collectible.sticker_mastery !== 100) {
		return $gettext(
			`Use this sticker to gain mastery. Once you master it, you'll be able to use it for emojis and reactions!`
		);
	}

	return $gettext(`You've mastered this sticker and can now use it for emojis and reactions!`);
});

const collectibleResourceAcquisition = computed(() => {
	const productType = collectible.type;
	if (!productType || productType === CollectibleType.Sticker) {
		return null;
	}
	// Ignore if we have no shop purchase acquisitions.
	if (collectible.acquisition.every(i => i.method !== AcquisitionMethod.ShopPurchase)) {
		return null;
	}

	let resource: PurchasableProductType;
	switch (productType) {
		case CollectibleType.AvatarFrame:
			resource = PurchasableProductType.AvatarFrame;
			break;
		case CollectibleType.Background:
			resource = PurchasableProductType.Background;
			break;
	}
	return {
		resource,
		resourceId: getCollectibleResourceId(collectible),
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
	<div class="flex flex-col gap-[16px]">
		<!-- Label -->
		<div class="text-center font-bold" :style="{ fontSize: kFontSizeLarge.px }">
			{{ collectible.name }}
		</div>

		<!-- Image -->
		<div class="w-full max-w-[200px] self-center">
			<AppAspectRatio :ratio="1">
				<img
					:style="{
						width: `100%`,
						height: `auto`,
						borderRadius:
							collectible.type === CollectibleType.Background
								? kBorderRadiusBase.px
								: undefined,
					}"
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
				<div class="flex flex-none flex-row items-center gap-[8px]">
					<div class="flex-none" :style="{ fontSize: kFontSizeSmall.px }">
						{{ collectible.sticker_mastery }}%
					</div>
					<div class="flex-auto">
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

			<div class="grid grid-cols-2 gap-[8px]">
				<div v-for="pack in maybePacks" :key="pack.id">
					<AppStickerPack
						v-if="isInstance(pack, StickerPackModel)"
						:pack="pack"
						show-name
						can-click-pack
						@click-pack="
							showPurchaseShopProductModal({
								resource: PurchasableProductType.StickerPack,
								resourceId: pack.id,
							})
						"
					/>
					<AppAspectRatio
						v-else
						class="rounded"
						:style="{
							backgroundColor: kThemeFg10,
						}"
						:ratio="StickerPackRatio"
						:inner-styles="{
							display: `flex`,
							alignItems: `center`,
							justifyContent: `center`,
						}"
					>
						<AppCircularProgress class="w-[36px] max-w-full" />
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
