<script lang="ts" setup>
import { AvatarFrameModel } from '../../../../../../_common/avatar/frame.model';
import AppLinkHelp from '../../../../../../_common/link/AppLinkHelp.vue';
import { ShopProductResource } from '../../../../../../_common/shop/product/product-model';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { ShopDashProductType, useShopDashStore } from '../../shop.store';
import AppDashShopProductHeader from '../AppDashShopProductHeader.vue';
import FormShopProductBase, { createShopProductBaseForm } from './FormShopProductBase.vue';

type Props = {
	model?: AvatarFrameModel;
};
const { model } = defineProps<Props>();

const shopStore = useShopDashStore()!;

const data = createShopProductBaseForm({
	shopStore,
	resource: ShopProductResource.AvatarFrame,
	baseModel: model,
});

const { productType, isEditing } = data;
</script>

<template>
	<AppDashShopProductHeader
		:product-type="productType"
		:heading="isEditing ? $gettext(`Edit avatar frame`) : $gettext(`Add avatar frame`)"
	>
		<div v-if="productType === ShopDashProductType.Premium">
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
