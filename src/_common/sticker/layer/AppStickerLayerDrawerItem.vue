<script lang="ts" setup>
import { computed, PropType, ref, StyleValue, toRefs } from 'vue';
import { useDrawerStore } from '../../drawer/drawer-store';
import AppQuestFrame from '../../quest/AppQuestFrame.vue';
import { Sticker } from '../sticker.model';

const props = defineProps({
	sticker: {
		type: Object as PropType<Sticker>,
		required: true,
	},
	count: {
		type: Number,
		default: 0,
	},
	size: {
		type: Number,
		default: 64,
	},
	hideCount: {
		type: Boolean,
	},
});

const { sticker, count, size, hideCount } = toRefs(props);

const drawerStore = useDrawerStore();
const root = ref<HTMLDivElement>();

const currentStreak = computed(() => {
	const streak = drawerStore.streak.value;
	if (streak?.sticker.id !== sticker.value.id) {
		return 0;
	}
	return streak.count;
});

const itemStyling = computed<StyleValue>(() => ({
	height: size.value + 'px',
	width: size.value + 'px',
	cursor: drawerStore.isDragging.value ? 'grabbing' : 'grab',
}));

const isPeeled = computed(
	() => drawerStore.sticker.value?.id === sticker.value.id || count.value < 1
);

const slotName = computed(() => {
	if (sticker.value.is_event) {
		return 'above';
	}
	return 'default';
});
</script>

<template>
	<div ref="root" class="-item" draggable="false" @contextmenu.prevent>
		<component :is="sticker.is_event ? AppQuestFrame : 'div'" :style="itemStyling">
			<template #[slotName]>
				<div :class="{ '-peeled': isPeeled }">
					<img
						draggable="false"
						class="-img"
						:style="itemStyling"
						:src="sticker.img_url"
						@dragstart.prevent
					/>
				</div>
			</template>
		</component>

		<div v-if="currentStreak > 1" class="-pocket-left badge fill-dark">
			<div class="-rarity">x{{ currentStreak }}</div>
		</div>

		<div v-if="!hideCount" class="-pocket badge fill-dark">
			<div
				class="-rarity"
				:class="{
					'-rarity-uncommon': sticker.rarity === 1,
					'-rarity-rare': sticker.rarity === 2,
					'-rarity-epic': sticker.rarity === 3,
				}"
			>
				{{ count }}
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-item
	position: relative
	height: 64px
	width: 64px
	user-drag: none
	user-select: none
	touch-action: none

.-peeled
	filter: contrast(0)

.-pocket-left
	position: absolute
	top: 0
	left: 0
	pointer-events: none

.-pocket
	position: absolute
	bottom: 0
	right: 0
	pointer-events: none

.-rarity
	font-weight: bold

	&-uncommon
		color: #1bb804

	&-rare
		color: #18a5f2

	&-epic
		color: #ffbc56
</style>
