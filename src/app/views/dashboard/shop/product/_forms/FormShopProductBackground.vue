<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import { BackgroundModel } from '../../../../../../_common/background/background.model';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import { ShopProductResource } from '../../../../../../_common/shop/product/product-model';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { ShopDashProductType, useShopDashStore } from '../../shop.store';
import AppDashShopProductHeader from '../AppDashShopProductHeader.vue';
import FormShopProductBase, { createShopProductBaseForm } from './FormShopProductBase.vue';

const props = defineProps({
	...defineFormProps<BackgroundModel>(),
});

const { model } = toRefs(props);

const shopStore = useShopDashStore()!;

const data = createShopProductBaseForm({
	shopStore,
	resource: ShopProductResource.Background,
	baseModel: model?.value,
});

const { productType, isEditing } = data;

// Only premium backgrounds are valid at the moment, so no need for free
// messaging.
const headerMessage = computed(() => {
	switch (productType.value) {
		case ShopDashProductType.Premium:
			return $gettext(`Premium backgrounds can be purchased in your shop.`);
	}
});
</script>

<template>
	<AppDashShopProductHeader
		:product-type="productType"
		:heading="isEditing ? $gettext(`Background product`) : $gettext(`Add background`)"
		:message="headerMessage"
	/>

	<FormShopProductBase :data="data" />
</template>
