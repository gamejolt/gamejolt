<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import { AvatarFrameModel } from '../../../../../../_common/avatar/frame.model';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
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

// Only premium avatars are valid at the moment, so no need for free messaging.
const headerMessage = computed(() => {
	switch (productType.value) {
		case ShopDashProductType.Premium:
			return $gettext(`Premium avatar frames can be purchased in your shop.`);
	}
});
</script>

<template>
	<AppDashShopProductHeader
		:product-type="productType"
		:heading="isEditing ? $gettext(`Avatar frame product`) : $gettext(`Add avatar frame`)"
		:message="headerMessage"
	/>

	<FormShopProductBase :data="data" />
</template>
