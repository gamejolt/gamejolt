<script lang="ts" setup>
import { onMounted } from 'vue';

import { GiftAction } from '~app/components/gift/modal.service';
import { trackGiftAction } from '~common/analytics/analytics.service';
import AppButton from '~common/button/AppButton.vue';
import AppShopProductDisplay from '~common/inventory/shop/AppShopProductDisplay.vue';
import { InventoryShopGiftModel } from '~common/inventory/shop/inventory-shop-gift.model';
import {
	getShopProductDisplayData,
	InventoryShopProduct,
} from '~common/inventory/shop/product-owner-helpers';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppSectionTitle from '~common/section/AppSectionTitle.vue';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { showStickerPackContentsModal } from '~common/sticker/pack/contents-modal/modal.service';
import { StickerPackModel } from '~common/sticker/pack/pack.model';
import { $gettext } from '~common/translate/translate.service';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';
import { isInstance } from '~utils/utils';

type Props = {
	gift: InventoryShopGiftModel;
	product: InventoryShopProduct;
};
const { gift, product } = defineProps<Props>();

const modal = useModal<GiftAction>()!;

onMounted(() => {
	trackGiftAction({ action: 'view', giftId: gift.id });
});

function doAction(action: 'accept' | 'reject' | 'ignore') {
	trackGiftAction({ action, giftId: gift.id });
	modal.resolve(action);
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 v-if="!gift.from_user" class="modal-title" :style="{ textAlign: `center` }">
				{{ $gettext(`New gift`) }}
			</h2>
			<AppSectionTitle v-else center :style="{ width: `100%` }" :avatar-height="48">
				<template #avatar>
					<AppUserAvatarBubble :user="gift.from_user" show-frame show-verified smoosh />
				</template>

				<template #supertitle>
					{{ $gettext(`Gift from`) }}
				</template>
				<template #title> @{{ gift.from_user.username }} </template>
			</AppSectionTitle>
		</div>

		<div class="modal-body">
			<AppShopProductDisplay
				:product-data="
					getShopProductDisplayData({
						resource: gift.product_type,
						resourceId: product.id,
					})
				"
			/>

			<div
				:style="{
					display: `grid`,
					gridTemplateColumns: `minmax(0, 400px)`,
					justifyContent: `center`,
				}"
			>
				<AppSpacer :scale="4" vertical />

				<div :style="{ display: `flex`, gap: `12px` }">
					<AppButton :style="{ margin: 0 }" block solid @click="doAction('reject')">
						{{ $gettext(`Reject`) }}
					</AppButton>
					<AppButton
						:style="{ margin: 0 }"
						block
						solid
						primary
						@click="doAction('accept')"
					>
						{{ $gettext(`Accept`) }}
					</AppButton>
				</div>

				<template v-if="isInstance(gift.product, StickerPackModel)">
					<AppSpacer :scale="3" vertical />
					<AppButton block @click="showStickerPackContentsModal(gift.product)">
						{{ $gettext(`View pack contents`) }}
					</AppButton>
				</template>
			</div>
		</div>
	</AppModal>
</template>
