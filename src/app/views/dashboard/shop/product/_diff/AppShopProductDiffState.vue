<script lang="ts" setup>
import { computed } from 'vue';

import { ShopDashProductStates } from '~app/views/dashboard/shop/shop.store';
import AppJolticon, { Jolticon } from '~common/jolticon/AppJolticon.vue';
import { ShopProductResource } from '~common/shop/product/product-model';
import {
	kThemeBiBg,
	kThemeBiFg,
	kThemeFg,
	kThemeFg10,
	kThemeGjOverlayNotice,
} from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';
import { kFontSizeBase } from '~styles/variables';

type Props = {
	resource: ShopProductResource;
	itemStates: ShopDashProductStates;
};
const { resource, itemStates } = defineProps<Props>();

const data = computed(() => {
	const { inReview, rejected, published } = itemStates;

	if (inReview) {
		return {
			icon: 'clock' as Jolticon,
			label: $gettext(`In review`),
		};
	} else if (rejected) {
		return {
			icon: 'exclamation-circle' as Jolticon,
			label: $gettext(`Changes rejected`),
		};
	} else if (published) {
		let label = $gettext(`Published`);
		if (resource === ShopProductResource.Sticker) {
			label = $gettext(`In published sticker pack`);
		}

		return {
			icon: 'marketplace' as Jolticon,
			label,
		};
	}
});
</script>

<template>
	<div
		v-if="data"
		class="rounded-lg inline-flex items-center justify-center gap-[6px]"
		:style="{
			padding: `2px 8px`,
			backgroundColor: itemStates.rejected
				? kThemeGjOverlayNotice
				: itemStates.published
				? kThemeBiBg
				: kThemeFg10,
			color: itemStates.rejected ? `white` : itemStates.published ? kThemeBiFg : kThemeFg,
			fontSize: kFontSizeBase.px,
			fontWeight: `bold`,
			marginRight: `auto`,
		}"
	>
		<AppJolticon
			:icon="data.icon"
			:style="{
				margin: 0,
				color: `inherit`,
				fontSize: `inherit`,
			}"
		/>

		{{ data.label }}
	</div>
</template>
