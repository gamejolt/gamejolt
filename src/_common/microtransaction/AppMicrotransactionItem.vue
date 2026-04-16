<script lang="ts" setup>
import { computed, CSSProperties, onMounted, StyleValue, toRef } from 'vue';

import { useDynamicSlots } from '~common/component-helpers';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import { MicrotransactionProductModel } from '~common/microtransaction/product.model';
import { kThemeFg10 } from '~common/theme/variables';
import { styleBorderRadiusBase } from '~styles/mixins';
import { kFontFamilyHeading, kFontSizeLarge, kLineHeightBase } from '~styles/variables';

type DynamicSlotsProp = 'trailing'[] | Record<'trailing', boolean> | boolean;

type Props = {
	dynamicSlots?: DynamicSlotsProp;
	item?: MicrotransactionProductModel;
	isPlaceholder?: boolean;
};
const { dynamicSlots = false, item, isPlaceholder } = defineProps<Props>();

onMounted(() => {
	if (!item && !isPlaceholder) {
		throw Error('AppMicrotransactionItem: item prop is required when not using placeholder');
	}
});

const { hasSlot } = useDynamicSlots(toRef(() => dynamicSlots));

const itemStyles = computed<CSSProperties>(() => {
	return { display: `flex`, alignItems: `flex-start`, gap: `12px`, padding: `8px 0` };
});

const itemLeadingStyles = computed(() => {
	const result: StyleValue = [
		{
			width: `48px`,
			height: `48px`,
			flex: `none`,
		},
	];

	if (isPlaceholder) {
		result.push(placeholderStyles);
	}

	return result;
});

const titleFontSize = kFontSizeLarge;
const itemTitleStyles = computed(() => {
	const result: StyleValue = [
		{
			flex: `auto`,
			minWidth: 0,
			fontSize: titleFontSize.px,
			fontFamily: kFontFamilyHeading,
			minHeight: `48px`,
			display: `inline-flex`,
			alignItems: `center`,
			alignSelf: `center`,
		},
	];

	if (isPlaceholder) {
		result.push(placeholderStyles, {
			height: titleFontSize.value * kLineHeightBase + 'px',
			maxHeight: 0,
		});
	}

	return result;
});

const itemTrailingStyles = computed(() => {
	const result: StyleValue = {
		minHeight: `48px`,
		display: `flex`,
		alignItems: `center`,
		flex: `none`,
	};

	return result;
});

const placeholderStyles: CSSProperties = {
	...styleBorderRadiusBase,
	background: kThemeFg10,
};
</script>

<template>
	<div :style="itemStyles">
		<div :style="itemLeadingStyles">
			<AppImgResponsive
				v-if="item"
				:src="item.media_item.mediaserver_url"
				:style="{
					width: `100%`,
					height: `100%`,
					objectFit: `cover`,
					objectPosition: `center`,
				}"
			/>
		</div>

		<div :style="itemTitleStyles">
			<template v-if="item">
				{{ item.display_name }}
			</template>
		</div>

		<div v-if="hasSlot('trailing')" :style="itemTrailingStyles">
			<slot name="trailing">
				<div
					v-if="isPlaceholder"
					:style="[
						placeholderStyles,
						{
							width: `48px`,
							height: `36px`,
						},
					]"
				/>
			</slot>
		</div>
	</div>
</template>
