<script lang="ts" setup>
import AppAspectRatio from '../../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppHoverCard from '../../../../../../_common/card/AppHoverCard.vue';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import { ShopProductResource } from '../../../../../../_common/shop/product/product-model';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import { kThemeBgSubtle } from '../../../../../../_common/theme/variables';
import { styleFlexCenter } from '../../../../../../_styles/mixins';
import { routeDashShopProduct } from '../../product/product.route';
import { getShopDashProductResourceParam } from '../../shop.store';

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
