<script lang="ts" setup generic="T extends Record<string, any>">
import { PropType, computed, toRefs } from 'vue';
import { getModel } from '../../../../../../_common/model/model-store.service';
import AppStickerStackItem from '../../../../../../_common/sticker/stack/AppStickerStackItem.vue';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import { kThemeFgMuted } from '../../../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { styleAbsoluteFill, styleLineClamp, styleWhen } from '../../../../../../_styles/mixins';
import { kFontSizeSmall } from '../../../../../../_styles/variables';
import { isInstance } from '../../../../../../utils/utils';
import { useShopManagerStore } from '../../shop.store';

const props = defineProps({
	current: {
		type: Object as PropType<{ name: string } & T>,
		required: true,
	},
	other: {
		type: Object as PropType<{ name: string } & T>,
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

const { isSameValues } = useShopManagerStore()!;

function parseEntry(key: string, val: any) {
	const newEntry: [string, any] = [key, val];

	// Get sticker models from the ModelStore if we have a list of sticker
	// IDs.
	if (key === 'stickers' && Array.isArray(val) && val.length > 0 && typeof val[0] === 'number') {
		// TODO (creator-shops) This won't show all the stickers selected if
		// our primary route doesn't load them in.
		const stickers = val.reduce((acc, id) => {
			const model = getModel(StickerModel, id);
			if (model) {
				acc.push(model);
			}
			return acc;
		}, [] as StickerModel[]);
		newEntry[1] = stickers;
	}

	return newEntry;
}

const entries = computed(() =>
	Object.entries(current.value).map(([key, val]) => parseEntry(key, val))
);

function isFieldEqual(key: string): boolean {
	if (!other?.value) {
		return true;
	}

	return isSameValues(parseEntry(key, current.value[key]), parseEntry(key, other.value[key]));
}

function prettyKey(key: string) {
	const newKey = key.replace(/[_-]/g, ' ');
	return newKey[0].toUpperCase() + newKey.slice(1);
}

function isArrayOfInstance<T>(value: any, type: new (data: any) => T): value is T[] {
	return Array.isArray(value) && value.length > 0 && isInstance(value[0], type);
}

function isSimpleValue(value: any) {
	return typeof value === 'number' || typeof value === 'string';
}
</script>

<template>
	<div>
		<div
			v-for="[key, value] in entries"
			:key="key"
			:style="{
				fontSize: kFontSizeSmall.px,
				marginBottom: `8px`,
			}"
		>
			<div :style="{ fontWeight: `bold` }">
				<span v-app-tooltip.touchable="value">
					{{ prettyKey(key) }}
				</span>
			</div>
			{{ ' ' }}
			<template v-if="value && (!Array.isArray(value) || value.length)">
				<div
					:style="{
						position: `relative`,
						zIndex: 1,
						...styleWhen(isSimpleValue(value), {
							width: `fit-content`,
						}),
					}"
				>
					<!-- Value display -->
					<div v-if="isSimpleValue(value)" :style="styleLineClamp(3)">
						{{ value }}
					</div>
					<div
						v-else-if="isArrayOfInstance(value, StickerModel)"
						:style="{
							display: `grid`,
							gridTemplateColumns: `repeat(auto-fill, minmax(64px, 1fr))`,
						}"
					>
						<div v-for="sticker in value" :key="sticker.id" :style="{ padding: `4px` }">
							<AppStickerStackItem :img-url="sticker.img_url" />
						</div>
					</div>

					<!-- Diff color indicator -->
					<div
						:style="[
							styleAbsoluteFill({ zIndex: -1, left: `-4px`, right: `-4px` }),
							styleWhen(!isFieldEqual(key), {
								backgroundColor: diffBackground,
								color: diffColor,
								borderRadius: `4px`,
								opacity: 0.2,
							}),
						]"
					/>
				</div>
			</template>
			<div v-else :style="{ color: kThemeFgMuted, fontStyle: `italic` }">
				{{ $gettext(`none`) }}
			</div>
		</div>
	</div>
</template>
