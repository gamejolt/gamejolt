<script lang="ts" setup>
import { PropType, onMounted, toRefs } from 'vue';
import { trackGiftAction } from '../../../_common/analytics/analytics.service';
import AppButton from '../../../_common/button/AppButton.vue';
import AppShopProductDisplay from '../../../_common/inventory/shop/AppShopProductDisplay.vue';
import { InventoryShopGiftModel } from '../../../_common/inventory/shop/inventory-shop-gift.model';
import {
	InventoryShopProduct,
	getShopProductDisplayData,
} from '../../../_common/inventory/shop/product-owner-helpers';
import AppModal from '../../../_common/modal/AppModal.vue';
import { useModal } from '../../../_common/modal/modal.service';
import AppSectionTitle from '../../../_common/section/AppSectionTitle.vue';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import { showStickerPackContentsModal } from '../../../_common/sticker/pack/contents-modal/modal.service';
import { StickerPackModel } from '../../../_common/sticker/pack/pack.model';
import { $gettext } from '../../../_common/translate/translate.service';
import AppUserAvatarBubble from '../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { isInstance } from '../../../utils/utils';
import { GiftAction } from './modal.service';

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

const modal = useModal<GiftAction>()!;

onMounted(() => {
	trackGiftAction({ action: 'view', giftId: gift.value.id });
});

function doAction(action: 'accept' | 'reject' | 'ignore') {
	trackGiftAction({ action, giftId: gift.value.id });
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
