<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { kFontFamilyDisplay } from '../../_styles/variables';
import { assertNever } from '../../utils/utils';
import AppCollectibleThumb from '../collectible/AppCollectibleThumb.vue';
import { CollectibleModel, CollectibleType } from '../collectible/collectible.model';
import { $gettext } from '../translate/translate.service';

const props = defineProps({
	type: {
		type: Object as PropType<CollectibleType>,
		required: true,
	},
	collectibles: {
		type: Array as PropType<CollectibleModel[]>,
		required: true,
	},
});

const { type } = toRefs(props);

const label = computed(() => {
	switch (type.value) {
		case CollectibleType.AvatarFrame:
			return $gettext(`Avatar Frames`);
		case CollectibleType.Background:
			return $gettext(`Backgrounds`);
		case CollectibleType.Sticker:
			return $gettext(`Stickers`);
		default:
			assertNever(type.value);
	}
});
</script>

<template>
	<h2
		:style="{
			marginTop: `0`,
			fontFamily: kFontFamilyDisplay,
		}"
	>
		{{ label }}
	</h2>

	<div
		:style="{
			display: `grid`,
			gridTemplateColumns: `repeat(auto-fill, minmax(160px, 1fr))`,
			gridGap: `8px`,
		}"
	>
		<AppCollectibleThumb
			v-for="collectible of collectibles"
			:key="collectible.id"
			:collectible="collectible"
		/>
	</div>
</template>
