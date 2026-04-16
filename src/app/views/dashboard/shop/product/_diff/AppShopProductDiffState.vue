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
import { styleBorderRadiusLg, styleFlexCenter, styleWhen } from '~styles/mixins';
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
		:style="[
			styleBorderRadiusLg,
			styleFlexCenter({
				display: `inline-flex`,
				gap: `6px`,
			}),
			{
				borderRadius: `12px`,
				padding: `2px 8px`,
				backgroundColor: kThemeFg10,
				color: kThemeFg,
				fontSize: kFontSizeBase.px,
				fontWeight: `bold`,
				marginRight: `auto`,
			},
			styleWhen(itemStates.rejected, {
				backgroundColor: kThemeGjOverlayNotice,
				color: `white`,
			}),
			styleWhen(itemStates.published, {
				backgroundColor: kThemeBiBg,
				color: kThemeBiFg,
			}),
		]"
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
