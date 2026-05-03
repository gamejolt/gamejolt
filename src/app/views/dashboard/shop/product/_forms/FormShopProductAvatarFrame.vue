<script lang="ts" setup>
import FormShopProductBase, {
	createShopProductBaseForm,
} from '~app/views/dashboard/shop/product/_forms/FormShopProductBase.vue';
import AppDashShopProductHeader from '~app/views/dashboard/shop/product/AppDashShopProductHeader.vue';
import { ShopDashProductTypePremium, useShopDashStore } from '~app/views/dashboard/shop/shop.store';
import { AvatarFrameModel } from '~common/avatar/frame.model';
import AppLinkHelp from '~common/link/AppLinkHelp.vue';
import { ShopProductResourceAvatarFrame } from '~common/shop/product/product-model';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	model?: AvatarFrameModel;
};
const { model } = defineProps<Props>();

const shopStore = useShopDashStore()!;

const data = createShopProductBaseForm({
	shopStore,
	resource: ShopProductResourceAvatarFrame,
	baseModel: model,
});

const { productType, isEditing } = data;
</script>

<template>
	<AppDashShopProductHeader
		:product-type="productType"
		:heading="isEditing ? $gettext(`Edit avatar frame`) : $gettext(`Add avatar frame`)"
	>
		<div v-if="productType === ShopDashProductTypePremium">
			{{
				$gettext(
					`Premium avatar frames are available for purchase with joltbux in your shop. We recommend you upload animated avatars.`
				)
			}}
		</div>
		<div>
			<AppLinkHelp page="shop">
				{{ $gettext(`Learn about the shop.`) }}
			</AppLinkHelp>
		</div>
	</AppDashShopProductHeader>

	<FormShopProductBase :data="data" />
</template>
