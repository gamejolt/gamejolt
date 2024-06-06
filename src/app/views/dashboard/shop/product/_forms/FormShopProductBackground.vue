<script lang="ts" setup>
import { toRefs } from 'vue';
import { BackgroundModel } from '../../../../../../_common/background/background.model';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import AppLinkHelp from '../../../../../../_common/link/AppLinkHelp.vue';
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
</script>

<template>
	<AppDashShopProductHeader
		:product-type="productType"
		:heading="isEditing ? $gettext(`Edit background`) : $gettext(`Add background`)"
	>
		<!-- Only premium backgrounds are valid at the moment, so no need for free messaging. -->
		<template v-if="productType === ShopDashProductType.Premium">
			<div>
				{{
					$gettext(
						`Premium backgrounds are available for purchase with joltbux in your shop. We recommend you upload animated backgrounds.`
					)
				}}
			</div>
			<div>
				<AppLinkHelp page="shop">
					{{ $gettext(`Learn about the shop.`) }}
				</AppLinkHelp>
			</div>
		</template>
	</AppDashShopProductHeader>

	<FormShopProductBase :data="data" />
</template>
