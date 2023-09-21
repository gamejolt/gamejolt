<script lang="ts" setup>
import { PropType } from 'vue';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { styleFlexCenter } from '../../../../_styles/mixins';
import AppDashShopHover from './AppDashShopHover.vue';
import { routeDashShopProduct } from './product/product.route';
import { ShopManagerGroupItemType, productTypeFromTypename } from './shop.store';

defineProps({
	typename: {
		type: String as PropType<ShopManagerGroupItemType>,
		required: true,
	},
	borderRadius: {
		type: Number,
		default: undefined,
	},
	borderWidth: {
		type: Number,
		default: undefined,
	},
	ratio: {
		type: Number,
		default: 1,
		validator: val => typeof val === 'number' && val > 0,
	},
});
</script>

<template>
	<AppDashShopHover
		:border-radius="borderRadius"
		:border-width="borderWidth"
		:to="{
			name: routeDashShopProduct.name,
			params: {
				type: productTypeFromTypename(typename),
			},
		}"
	>
		<AppAspectRatio
			:ratio="ratio"
			:style="{
				width: `100%`,
			}"
		>
			<div
				:style="[
					styleFlexCenter({ direction: `column` }),
					{
						width: `100%`,
						height: `100%`,
						fontWeight: `bold`,
					},
				]"
			>
				<AppJolticon icon="add" :style="{ margin: 0 }" />
				<AppSpacer :scale="2" vertical />
				{{ $gettext(`Add`) }}
			</div>
		</AppAspectRatio>
	</AppDashShopHover>
</template>
