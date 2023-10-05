<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import { AvatarFrameModel } from '../../../../../../_common/avatar/frame.model';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { useShopManagerStore } from '../../shop.store';
import AppDashShopProductHeader from '../AppDashShopProductHeader.vue';
import FormShopProductBase, {
	ShopProductPaymentType,
	createShopProductBaseForm,
} from './FormShopProductBase.vue';

const props = defineProps({
	...defineFormProps<AvatarFrameModel>(),
});

const { model } = toRefs(props);

const shopStore = useShopManagerStore()!;

const data = createShopProductBaseForm({
	shopStore,
	typename: 'Avatar_Frame',
	baseModel: model?.value,
});

const { paymentType, isEditing } = data;

// Only premium avatars are valid at the moment, so no need for free messaging.
const headerMessage = computed(() => {
	switch (paymentType.value) {
		case ShopProductPaymentType.Premium:
			return $gettext(`Premium avatar frames can be purchased in your shop.`);
	}
});
</script>

<template>
	<AppDashShopProductHeader
		:payment-type="paymentType"
		:heading="isEditing ? $gettext(`Avatar frame product`) : $gettext(`Add avatar frame`)"
		:message="headerMessage"
	/>

	<FormShopProductBase :data="data" />
</template>
