<script lang="ts" setup>
import { toRefs } from 'vue';
import { AvatarFrameModel } from '../../../../../../_common/avatar/frame.model';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import AppLinkHelp from '../../../../../../_common/link/AppLinkHelp.vue';
import { ShopProductResource } from '../../../../../../_common/shop/product/product-model';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { ShopDashProductType, useShopDashStore } from '../../shop.store';
import AppDashShopProductHeader from '../AppDashShopProductHeader.vue';
import FormShopProductBase, { createShopProductBaseForm } from './FormShopProductBase.vue';

const props = defineProps({
	...defineFormProps<AvatarFrameModel>(),
});

const { model } = toRefs(props);

const shopStore = useShopDashStore()!;

const data = createShopProductBaseForm({
	shopStore,
	resource: ShopProductResource.AvatarFrame,
	baseModel: model?.value,
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
					`Premium avatar frames are animated and available for purchase with joltbux in your shop.`
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
