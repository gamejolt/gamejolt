<script lang="ts" setup>
import FormShopProductBase, { createShopProductBaseForm } from '~app/views/dashboard/shop/product/_forms/FormShopProductBase.vue';
import AppDashShopProductHeader from '~app/views/dashboard/shop/product/AppDashShopProductHeader.vue';
import { ShopDashProductType, useShopDashStore } from '~app/views/dashboard/shop/shop.store';
import { BackgroundModel } from '~common/background/background.model';
import AppLinkHelp from '~common/link/AppLinkHelp.vue';
import { ShopProductResource } from '~common/shop/product/product-model';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	model?: BackgroundModel;
};
const { model } = defineProps<Props>();

const shopStore = useShopDashStore()!;

const data = createShopProductBaseForm({
	shopStore,
	resource: ShopProductResource.Background,
	baseModel: model,
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
