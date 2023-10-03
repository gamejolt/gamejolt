<script lang="ts">
import { PropType, computed, toRefs } from 'vue';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import { useShopManagerStore } from '../../shop.store';
import AppShopProductDiffMetaEntry from './AppShopProductDiffMetaEntry.vue';

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
const props = defineProps({
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

const { current, other } = toRefs(props);

const { stickers } = useShopManagerStore()!;

const entries = computed(() =>
	Object.entries(current.value).map(([key, val]) =>
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
