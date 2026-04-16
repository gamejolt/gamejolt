<script lang="ts">
import { computed } from 'vue';

import AppShopProductDiffMetaEntry from '~app/views/dashboard/shop/product/_diff/AppShopProductDiffMetaEntry.vue';
import { useShopDashStore } from '~app/views/dashboard/shop/shop.store';
import { StickerModel } from '~common/sticker/sticker.model';

export function parseProductDiffEntry(key: string, val: any, extras: { stickers: StickerModel[] }) {
	const newEntry: [string, any] = [key, val];

	// Get sticker models from the ModelStore if we have a list of sticker
	// IDs.
	if (key === 'stickers' && Array.isArray(val) && val.length > 0 && typeof val[0] === 'number') {
		const { stickers } = extras;
		newEntry[1] = val.reduce((acc, id) => {
			const sticker = stickers.find(sticker => sticker.id === id);
			if (sticker) {
				acc.push(sticker);
			}
			return acc;
		}, [] as StickerModel[]);
	}

	return newEntry;
}
</script>

<script lang="ts" setup generic="T extends Record<string, any>">
type Props = {
	current: T & { name: string };
	other?: T & { name: string };
	diffBackground?: string;
	diffColor?: string;
};
const { current, other, diffBackground, diffColor } = defineProps<Props>();

const { stickers } = useShopDashStore()!;

const entries = computed(() =>
	Object.entries(current).map(([key, val]) =>
		parseProductDiffEntry(key, val, { stickers: stickers.value.items })
	)
);
</script>

<template>
	<div>
		<AppShopProductDiffMetaEntry
			v-for="[key, value] in entries"
			:key="key"
			:entry="{ key, value }"
			:current="(current as any)"
			:other="(other as any)"
			:diff-background="diffBackground"
			:diff-color="diffColor"
		/>
	</div>
</template>
