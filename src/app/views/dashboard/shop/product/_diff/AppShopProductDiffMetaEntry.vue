<script lang="ts" setup generic="T extends Record<string, any>">
import { PropType, computed, toRefs } from 'vue';
import AppScrollScroller from '../../../../../../_common/scroll/AppScrollScroller.vue';
import AppStickerImg from '../../../../../../_common/sticker/AppStickerImg.vue';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import { kThemeFgMuted } from '../../../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { styleAbsoluteFill, styleLineClamp, styleWhen } from '../../../../../../_styles/mixins';
import { kFontSizeSmall, kLineHeightBase } from '../../../../../../_styles/variables';
import { isInstance } from '../../../../../../utils/utils';
import { useShopDashStore } from '../../shop.store';
import { parseProductDiffEntry } from './AppShopProductDiffMeta.vue';

const props = defineProps({
	entry: {
		type: Object as PropType<{ key: string; value: any }>,
		required: true,
	},
	current: {
		type: Object as PropType<T & { name: string }>,
		required: true,
	},
	other: {
		type: Object as PropType<T & { name: string }>,
		default: undefined,
	},
	diffBackground: {
		type: String,
		default: undefined,
	},
	diffColor: {
		type: String,
		default: undefined,
	},
});

const { current, other, entry } = toRefs(props);

const { isSameValues, stickers: shopStickers } = useShopDashStore()!;

function isFieldEqual(key: string): boolean {
	if (!other?.value) {
		return true;
	}

	const stickers = shopStickers.value.items;

	return isSameValues(
		parseProductDiffEntry(key, current.value[key], { stickers }),
		parseProductDiffEntry(key, other.value[key], { stickers })
	);
}

function prettyKey(key: string) {
	const newKey = key.replace(/[_-]/g, ' ');
	return newKey[0].toUpperCase() + newKey.slice(1);
}

function isArrayOfInstance<T>(value: any, type: new (data: any) => T): value is T[] {
	return Array.isArray(value) && value.length > 0 && isInstance(value[0], type);
}

function isSimple(val: any): val is number | string {
	return typeof val === 'number' || typeof val === 'string';
}

const helpers = computed(() => {
	let lineClamp: number | undefined = undefined;
	let tooltip: string | undefined = undefined;
	const { key, value } = entry.value;

	if (!isSimple(value)) {
		// Nothing to do, initial values are good.
	} else {
		lineClamp = key === 'name' ? 2 : 1;
		tooltip = `${value}`;
	}

	const fontSize = kFontSizeSmall.value;

	return {
		lineClamp,
		tooltip,
		fontSize: `${fontSize}px`,
		height: lineClamp ? `${fontSize * kLineHeightBase * lineClamp}px` : '',
	};
});
</script>

<template>
	<div
		:style="{
			fontSize: helpers.fontSize,
			marginBottom: `8px`,
		}"
	>
		<div :style="{ fontWeight: `bold` }">
			<span v-app-tooltip.touchable="helpers.tooltip">
				{{ prettyKey(entry.key) }}
			</span>
		</div>
		{{ ' ' }}
		<div :style="{ height: helpers.height }">
			<div
				v-if="entry.value && (!Array.isArray(entry.value) || entry.value.length)"
				:style="{
					position: `relative`,
					zIndex: 1,
					...styleWhen(isSimple(entry.value), {
						width: `fit-content`,
					}),
				}"
			>
				<!-- Value display -->
				<!-- Simple -->
				<div
					v-if="isSimple(entry.value)"
					:style="styleWhen(!!helpers.lineClamp, styleLineClamp(helpers.lineClamp!))"
				>
					{{ entry.value }}
				</div>
				<!-- Stickers -->
				<AppScrollScroller
					v-else-if="isArrayOfInstance(entry.value, StickerModel)"
					:style="{ whiteSpace: `nowrap` }"
					horizontal
				>
					<div
						v-for="sticker in entry.value"
						:key="sticker.id"
						:style="{ display: `inline-block`, padding: `4px` }"
					>
						<AppStickerImg :src="sticker.img_url" :size="64" />
					</div>
				</AppScrollScroller>

				<!-- Diff color indicator -->
				<div
					:style="[
						styleAbsoluteFill({ zIndex: -1, left: `-4px`, right: `-4px` }),
						styleWhen(!isFieldEqual(entry.key), {
							backgroundColor: diffBackground,
							color: diffColor,
							borderRadius: `4px`,
							opacity: 0.2,
						}),
					]"
				/>
			</div>
			<div v-else :style="{ color: kThemeFgMuted, fontStyle: `italic` }">
				{{ $gettext(`none`) }}
			</div>
		</div>
	</div>
</template>
