<script lang="ts" setup>
import { computed } from 'vue';

import { showGiftActionModal } from '~app/components/gift/modal.service';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import { AvatarFrameModel, DefaultAvatarFrameScale } from '~common/avatar/frame.model';
import AppBackground from '~common/background/AppBackground.vue';
import { BackgroundModel } from '~common/background/background.model';
import AppHoverCard from '~common/card/AppHoverCard.vue';
import { InventoryShopGiftModel } from '~common/inventory/shop/inventory-shop-gift.model';
import {
	getReadablePurchasableProductType,
	InventoryShopProduct,
} from '~common/inventory/shop/product-owner-helpers';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppStickerPack, { StickerPackRatio } from '~common/sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '~common/sticker/pack/pack.model';
import { useStickerStore } from '~common/sticker/sticker-store';
import { useCommonStore } from '~common/store/common-store';
import { kThemeFg10, kThemeFgMuted } from '~common/theme/variables';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleMaxWidthForOptions } from '~styles/mixins';
import { kFontSizeH2, kFontSizeSmall } from '~styles/variables';
import { isInstance } from '~utils/utils';

type Props = {
	gift: InventoryShopGiftModel;
	product: InventoryShopProduct;
};
const { gift, product } = defineProps<Props>();

const emit = defineEmits<{
	remove: [];
}>();

const { user: authedUser } = useCommonStore();
const { stickerPacks } = useStickerStore();

let isHandlingClick = false;

const readableProductType = computed(() => getReadablePurchasableProductType(gift.product_type));

const leadingData = computed(() => {
	if (isInstance(product, StickerPackModel)) {
		return {
			ratio: StickerPackRatio,
		};
	}

	return {
		ratio: 1,
	};
});

async function onClickGift() {
	if (isHandlingClick) {
		return;
	}
	isHandlingClick = true;
	try {
		const result = await showGiftActionModal({
			gift,
			product,
			stickerPacks,
		});
		if (result === 'accept' || result === 'reject') {
			emit('remove');
		}
	} finally {
		isHandlingClick = false;
	}
}
</script>

<template>
	<AppHoverCard :padding="16" disable-scale @click="onClickGift">
		<div
			:style="{
				display: `flex`,
				alignItems: `center`,
				columnGap: `12px`,
			}"
		>
			<!-- Leading -->
			<div
				:style="{
					...styleMaxWidthForOptions({
						ratio: leadingData.ratio,
						maxHeight: 64,
					}),
					flex: `auto`,
				}"
			>
				<AppUserAvatarBubble
					v-if="isInstance(product, AvatarFrameModel)"
					:user="authedUser"
					:frame-override="{
						image_url: product.image_url,
						scale: DefaultAvatarFrameScale,
					}"
					show-frame
					smoosh
				/>
				<AppBackground
					v-else-if="isInstance(product, BackgroundModel)"
					:background="product"
					:background-style="{
						backgroundSize: `cover`,
						backgroundPosition: `center center`,
					}"
				>
					<AppAspectRatio :ratio="1" />
				</AppBackground>
				<AppStickerPack v-else-if="isInstance(product, StickerPackModel)" :pack="product" />
				<div
					v-else
					class="flex items-center justify-center"
					:style="{
						width: `100%`,
						height: `100%`,
						borderRadius: `50%`,
						backgroundColor: kThemeFg10,
					}"
				>
					<AppJolticon class="text-[32px]" icon="gift" />
				</div>
			</div>

			<!-- Info -->
			<div class="min-w-0 [flex:1_1_0]">
				<div class="truncate">
					{{ readableProductType }}
				</div>
				<div
					class="truncate"
					:style="{
						color: kThemeFgMuted,
						fontSize: kFontSizeSmall.px,
					}"
				>
					{{ product.name }}
				</div>
				<div
					v-if="gift.from_user"
					class="truncate"
					:style="{
						color: kThemeFgMuted,
						fontSize: kFontSizeSmall.px,
					}"
				>
					@{{ gift.from_user.username }}
				</div>
			</div>

			<!-- Trailing -->
			<AppJolticon
				:style="{ color: kThemeFgMuted, fontSize: kFontSizeH2.px }"
				icon="chevron-right"
			/>
		</div>
	</AppHoverCard>
</template>
