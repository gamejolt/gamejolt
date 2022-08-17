<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppQuestFrame from '../../quest/AppQuestFrame.vue';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { $gettext } from '../../translate/translate.service';
import { Sticker } from '../sticker.model';

const props = defineProps({
	sticker: {
		type: Object as PropType<Sticker>,
		required: true,
	},
	label: {
		type: String,
		default: undefined,
	},
	isNew: {
		type: Boolean,
	},
});

const { sticker } = toRefs(props);

// NOTE: Check if this is actually used before removing.
const slotName = computed(() => {
	if (sticker.value.is_event) {
		return 'above';
	}
	return 'default';
});
</script>

<template>
	<div class="-card">
		<div class="-img-wrapper">
			<component :is="sticker.is_event ? AppQuestFrame : 'div'">
				<template #[slotName]>
					<img class="-img" :src="sticker.img_url" />
				</template>
			</component>
		</div>
		<div v-if="label" class="-pocket fill-darkest">
			<div
				class="-rarity"
				:class="{
					'-rarity-uncommon': sticker.rarity === 1,
					'-rarity-rare': sticker.rarity === 2,
					'-rarity-epic': sticker.rarity === 3,
				}"
			>
				{{ label }}
			</div>
		</div>
		<div v-if="isNew" class="-new-indicator">
			<span v-app-tooltip.touchable="$gettext(`Newly unlocked!`)" class="-new-icon" />
		</div>

		<slot />
	</div>
</template>

<style lang="stylus" scoped>
@import './variables'

.-card
	change-bg(bg)
	width: $card-width
	rounded-corners-lg()
	position: relative
	overflow: hidden
	elevate-hover-1()

.-img-wrapper
	margin: 12px
	width: 126px
	height: 126px

.-img
	display: block
	padding: 12px
	width: 100%
	height: 100%

.-pocket
	padding: 12px
	display: flex
	flex-direction: column
	align-items: center

.-rarity
	font-weight: bold

	&-uncommon
		color: #1bb804

	&-rare
		color: #18a5f2

	&-epic
		color: #ffbc56

.-new-indicator
	position: absolute
	top: 12px
	right: 12px

.-new-icon
	display: block
	width: 12px
	height: 12px
	border-radius: 50%
	background-color: var(--theme-bi-bg)
	elevate-2()
</style>
