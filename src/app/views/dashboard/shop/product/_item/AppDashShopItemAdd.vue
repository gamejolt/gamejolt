<script lang="ts" setup>
import { CSSProperties, PropType } from 'vue';
import AppAspectRatio from '../../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import { kThemeBgSubtle } from '../../../../../../_common/theme/variables';
import { styleFlexCenter } from '../../../../../../_styles/mixins';
import AppDashShopHover from '../../AppDashShopHover.vue';
import { ShopManagerGroupItemType, productTypeFromTypename } from '../../shop.store';
import { routeDashShopProduct } from '../product.route';

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

const containerStyles: CSSProperties = {
	...styleFlexCenter({ direction: `column` }),
	width: `100%`,
	height: `100%`,
	fontWeight: `bold`,
};
</script>

<template>
	<AppDashShopHover
		:border-radius="borderRadius"
		:border-width="borderWidth"
		:border-color="kThemeBgSubtle"
		:to="{
			name: routeDashShopProduct.name,
			params: {
				type: productTypeFromTypename(typename),
			},
		}"
		center
	>
		<AppAspectRatio :ratio="ratio" :style="{ width: `100%` }">
			<div :style="containerStyles">
				<AppJolticon icon="add" :style="{ margin: 0 }" />
				<AppSpacer :scale="2" vertical />
				{{ $gettext(`Add`) }}
			</div>
		</AppAspectRatio>
	</AppDashShopHover>
</template>
