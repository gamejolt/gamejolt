<script lang="ts" setup>
import { PropType } from 'vue';
import AppAspectRatio from '../../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import { ShopProductResource } from '../../../../../../_common/shop/product/product-model';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import { kThemeBgSubtle } from '../../../../../../_common/theme/variables';
import { styleFlexCenter } from '../../../../../../_styles/mixins';
import { routeDashShopProduct } from '../../product/product.route';
import { getShopDashProductResourceParam } from '../../shop.store';
import AppDashShopHover from '../AppDashShopHover.vue';

defineProps({
	resource: {
		type: String as PropType<ShopProductResource>,
		required: true,
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
		:border-color="kThemeBgSubtle"
		:to="{
			name: routeDashShopProduct.name,
			params: {
				resource: getShopDashProductResourceParam(resource),
			},
		}"
		center
	>
		<AppAspectRatio :ratio="ratio" :style="{ width: `100%` }">
			<div
				:style="{
					...styleFlexCenter({ direction: `column` }),
					width: `100%`,
					height: `100%`,
					fontWeight: `bold`,
				}"
			>
				<AppJolticon icon="add" :style="{ margin: 0 }" />
				<AppSpacer :scale="2" vertical />
				{{ $gettext(`Add`) }}
			</div>
		</AppAspectRatio>
	</AppDashShopHover>
</template>
