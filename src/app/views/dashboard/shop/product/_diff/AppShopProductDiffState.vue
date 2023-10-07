<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import AppJolticon, { Jolticon } from '../../../../../../_common/jolticon/AppJolticon.vue';
import { ShopProductResource } from '../../../../../../_common/shop/product/product-model';
import {
	kThemeBiBg,
	kThemeBiFg,
	kThemeFg,
	kThemeFg10,
	kThemeGjOverlayNotice,
} from '../../../../../../_common/theme/variables';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { styleBorderRadiusLg, styleFlexCenter, styleWhen } from '../../../../../../_styles/mixins';
import { kFontSizeBase } from '../../../../../../_styles/variables';
import { ShopDashProductStates } from '../../shop.store';

const props = defineProps({
	resource: {
		type: String as PropType<ShopProductResource>,
		required: true,
	},
	itemStates: {
		type: Object as PropType<ShopDashProductStates>,
		required: true,
	},
});

const { resource, itemStates } = toRefs(props);

const data = computed(() => {
	const { inReview, rejected, published } = itemStates.value;

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
		if (resource.value === ShopProductResource.Sticker) {
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
