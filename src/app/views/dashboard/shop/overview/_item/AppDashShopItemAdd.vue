<script lang="ts" setup>
import { routeDashShopProduct } from '~app/views/dashboard/shop/product/product.route';
import { getShopDashProductResourceParam } from '~app/views/dashboard/shop/shop.store';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppHoverCard from '~common/card/AppHoverCard.vue';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { ShopProductResource } from '~common/shop/product/product-model';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { kThemeBgSubtle } from '~common/theme/variables';
import { styleFlexCenter } from '~styles/mixins';

type Props = {
	resource: ShopProductResource;
	ratio?: number;
};
const { resource, ratio = 1 } = defineProps<Props>();
</script>

<template>
	<AppHoverCard
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
	</AppHoverCard>
</template>
