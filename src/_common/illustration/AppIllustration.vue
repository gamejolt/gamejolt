<script lang="ts">
import { computed, CSSProperties, useSlots } from 'vue';

import AppThemeSvg from '~common/theme/svg/AppThemeSvg.vue';

/**
 * Run all the assets through https://squoosh.app/
 *
 * Choose OxiPNG and to reduce the color palette. We can do that since we have
 * limited colors and it doesn't degrade the images.
 */
export interface IllustrationAsset {
	path: string;
	width: number;
	height: number;
	isSvg?: boolean;
	/**
	 * Only applies to SVGs.
	 */
	strictColors?: boolean;
}
</script>

<script lang="ts" setup>
type Props = {
	asset: IllustrationAsset;
	sm?: boolean;
	maxWidth?: number | string;
	maxTextWidth?: number | string;
	noMargin?: boolean;
	illStyles?: CSSProperties;
};
const {
	asset,
	sm,
	maxWidth,
	maxTextWidth = 500,
	noMargin,
	illStyles,
} = defineProps<Props>();

const slots = useSlots();

const hasContent = computed(() => !!slots.default);

const imgStyles = computed(() => {
	const result: CSSProperties = {};

	if (noMargin) {
		result.margin = 0;
	}
	if (maxWidth) {
		result.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
		result.height = 'auto';
	}
	if (illStyles) {
		Object.assign(result, illStyles);
	}

	return result;
});
</script>

<template>
	<div class="-container">
		<AppThemeSvg
			v-if="asset.isSvg === true"
			class="-ill"
			:style="imgStyles"
			v-bind="{
				width: asset.width / 2,
				height: asset.height / 2,
			}"
			:src="asset.path"
			:strict-colors="asset.strictColors === true"
		/>
		<img
			v-else
			class="-ill"
			:style="imgStyles"
			:width="asset.width / 2"
			:height="asset.height / 2"
			:src="asset.path"
		/>

		<div
			v-if="hasContent"
			class="-text"
			:class="{ '-sm': sm }"
			:style="{
				maxWidth: typeof maxTextWidth === 'number' ? `${maxTextWidth}px` : maxTextWidth,
			}"
		>
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-font-size-xs = 15px
$-font-size = 19px

.-container
	display: flex
	flex-direction: column
	align-items: center
	justify-content: center
	text-align: center

.-ill
	margin: 24px 0
	max-width: 100%

.-text
	color: var(--theme-fg-muted)
	font-size: $-font-size-xs

	@media $media-sm-up
		&:not(.-sm)
			font-size: $-font-size
</style>
