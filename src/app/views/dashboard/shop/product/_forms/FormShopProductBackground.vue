<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import { BackgroundModel } from '../../../../../../_common/background/background.model';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { useShopManagerStore } from '../../shop.store';
import AppDashShopProductHeader from '../AppDashShopProductHeader.vue';
import FormShopProductBase, {
	ShopProductPaymentType,
	createShopProductBaseForm,
} from './FormShopProductBase.vue';

const props = defineProps({
	...defineFormProps<BackgroundModel>(),
});

const { model } = toRefs(props);

const shopStore = useShopManagerStore()!;

const data = createShopProductBaseForm({
	shopStore,
	typename: 'Background',
	baseModel: model?.value,
});

const { paymentType, isEditing } = data;

// Only premium backgrounds are valid at the moment, so no need for free
// messaging.
const headerMessage = computed(() => {
	switch (paymentType.value) {
		case ShopProductPaymentType.Premium:
			return $gettext(`Premium backgrounds can be purchased in your shop.`);
	}
});
</script>

<template>
	<AppDashShopProductHeader
		:payment-type="paymentType"
		:heading="isEditing ? $gettext(`Background product`) : $gettext(`Add background`)"
		:message="headerMessage"
	/>

	<FormShopProductBase :data="data" />
</template>
