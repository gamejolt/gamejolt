<script lang="ts" setup>
import { routeDashShopProduct } from '~app/views/dashboard/shop/product/product.route';
import { getShopDashProductResourceParam } from '~app/views/dashboard/shop/shop.store';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppHoverCard from '~common/card/AppHoverCard.vue';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { ShopProductResource } from '~common/shop/product/product-model';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { kThemeBgSubtle } from '~common/theme/variables';

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
		<AppAspectRatio class="w-full" :ratio="ratio">
			<div class="flex h-full w-full flex-col items-center justify-center font-bold">
				<AppJolticon class="m-0" icon="add" />
				<AppSpacer :scale="2" vertical />
				{{ $gettext(`Add`) }}
			</div>
		</AppAspectRatio>
	</AppHoverCard>
</template>
