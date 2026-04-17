<script lang="ts" setup generic="T extends Record<string, any>">
import { computed } from 'vue';

import { parseProductDiffEntry } from '~app/views/dashboard/shop/product/_diff/AppShopProductDiffMeta.vue';
import { useShopDashStore } from '~app/views/dashboard/shop/shop.store';
import AppScrollScroller from '~common/scroll/AppScrollScroller.vue';
import AppStickerImg from '~common/sticker/AppStickerImg.vue';
import { StickerModel } from '~common/sticker/sticker.model';
import { kThemeFgMuted } from '~common/theme/variables';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { styleLineClamp } from '~styles/mixins';
import { kFontSizeSmall, kLineHeightBase } from '~styles/variables';
import { isInstance } from '~utils/utils';

type Props = {
	entry: { key: string; value: any };
	current: T & { name: string };
	other?: T & { name: string };
	diffBackground?: string;
	diffColor?: string;
};
const { current, other, entry, diffBackground, diffColor } = defineProps<Props>();

const { isSameValues, stickers: shopStickers } = useShopDashStore()!;

function isFieldEqual(key: string): boolean {
	if (!other) {
		return true;
	}

	const stickers = shopStickers.value.items;

	return isSameValues(
		parseProductDiffEntry(key, current[key], { stickers }),
		parseProductDiffEntry(key, other[key], { stickers })
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
	const { key, value } = entry;

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
		<div class="font-bold">
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
					width: isSimple(entry.value) ? `fit-content` : undefined,
				}"
			>
				<!-- Value display -->
				<!-- Simple -->
				<div
					v-if="isSimple(entry.value)"
					:style="helpers.lineClamp ? styleLineClamp(helpers.lineClamp) : undefined"
				>
					{{ entry.value }}
				</div>
				<!-- Stickers -->
				<AppScrollScroller
					v-else-if="isArrayOfInstance(entry.value, StickerModel)"
					class="whitespace-nowrap"
					horizontal
				>
					<div
						v-for="sticker in entry.value"
						:key="sticker.id"
						class="inline-block p-[4px]"
					>
						<AppStickerImg :src="sticker.img_url" :size="64" />
					</div>
				</AppScrollScroller>

				<!-- Diff color indicator -->
				<div
					class="absolute top-0 bottom-0 left-[-4px] right-[-4px] z-[-1]"
					:style="
						!isFieldEqual(entry.key)
							? {
									backgroundColor: diffBackground,
									color: diffColor,
									borderRadius: `4px`,
									opacity: 0.2,
							  }
							: undefined
					"
				/>
			</div>
			<div v-else :style="{ color: kThemeFgMuted, fontStyle: `italic` }">
				{{ $gettext(`none`) }}
			</div>
		</div>
	</div>
</template>
