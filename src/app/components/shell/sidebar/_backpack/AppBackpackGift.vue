<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import AppAspectRatio from '../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import {
	AvatarFrameModel,
	DefaultAvatarFrameScale,
} from '../../../../../_common/avatar/frame.model';
import AppBackground from '../../../../../_common/background/AppBackground.vue';
import { BackgroundModel } from '../../../../../_common/background/background.model';
import AppHoverCard from '../../../../../_common/card/AppHoverCard.vue';
import { InventoryShopGiftModel } from '../../../../../_common/inventory/shop/inventory-shop-gift.model';
import {
	InventoryShopProduct,
	getReadablePurchasableProductType,
} from '../../../../../_common/inventory/shop/product-owner-helpers';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppStickerPack, {
	StickerPackRatio,
} from '../../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';
import { useStickerStore } from '../../../../../_common/sticker/sticker-store';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { kThemeFg10, kThemeFgMuted } from '../../../../../_common/theme/variables';
import AppUserAvatarBubble from '../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import {
	styleFlexCenter,
	styleMaxWidthForOptions,
	styleTextOverflow,
} from '../../../../../_styles/mixins';
import { kFontSizeH2, kFontSizeSmall } from '../../../../../_styles/variables';
import { isInstance } from '../../../../../utils/utils';
import { showGiftActionModal } from '../../../gift/modal.service';

const props = defineProps({
	gift: {
		type: Object as PropType<InventoryShopGiftModel>,
		required: true,
	},
	product: {
		type: Object as PropType<InventoryShopProduct>,
		required: true,
	},
});

const { gift, product } = toRefs(props);

const emit = defineEmits({
	remove: () => true,
});

const { user: authedUser } = useCommonStore();
const { stickerPacks } = useStickerStore();

let isHandlingClick = false;

const readableProductType = computed(() =>
	getReadablePurchasableProductType(gift.value.product_type)
);

const leadingData = computed(() => {
	if (isInstance(product.value, StickerPackModel)) {
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
			gift: gift.value,
			product: product.value,
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
					:style="{
						...styleFlexCenter(),
						width: `100%`,
						height: `100%`,
						borderRadius: `50%`,
						backgroundColor: kThemeFg10,
					}"
				>
					<AppJolticon icon="gift" :style="{ fontSize: `32px` }" />
				</div>
			</div>

			<!-- Info -->
			<div :style="{ flex: `1 1 0`, minWidth: 0 }">
				<div :style="{ ...styleTextOverflow }">
					{{ readableProductType }}
				</div>
				<div
					:style="{
						...styleTextOverflow,
						color: kThemeFgMuted,
						fontSize: kFontSizeSmall.px,
					}"
				>
					{{ product.name }}
				</div>
				<div
					v-if="gift.from_user"
					:style="{
						...styleTextOverflow,
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
