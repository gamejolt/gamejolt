<script lang="ts" setup>
import { PropType, ref, toRefs, watch } from 'vue';
import AppGameMediaBar from '../../game/media-bar/AppGameMediaBar.vue';
import { MediaItemModel } from '../../media-item/media-item-model';

const props = defineProps({
	items: {
		type: Array as PropType<MediaItemModel[]>,
		required: true,
	},
	num: {
		type: Number,
		required: true,
	},
});

const { items, num } = toRefs(props);

const _items = ref<MediaItemModel[]>([]);

watch(
	items,
	() => {
		trim();
	},
	{ deep: true }
);
function trim() {
	_items.value = (items.value || []).slice(0, num.value || 6);
}
</script>

<template>
	<div v-if="_items.length" class="widget-compiler-widget-game-media">
		<AppGameMediaBar :media-items="_items" />
	</div>
</template>
