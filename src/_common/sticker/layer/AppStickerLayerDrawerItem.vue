<script lang="ts" setup>
import { computed, CSSProperties, PropType, StyleValue, toRefs } from 'vue';
import {
	styleBorderRadiusBase,
	styleBorderRadiusLg,
	styleChangeBg,
	styleElevate,
	styleWhen,
} from '../../../_styles/mixins';
import { kBorderWidthLg } from '../../../_styles/variables';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import AppQuestFrame from '../../quest/AppQuestFrame.vue';
import AppSpacer from '../../spacer/AppSpacer.vue';
import { kThemeBgActual, kThemeFg10, kThemePrimary } from '../../theme/variables';
import AppUserAvatar from '../../user/user-avatar/AppUserAvatar.vue';
import AppStickerImg from '../AppStickerImg.vue';
import { useStickerStore } from '../sticker-store';
import { Sticker } from '../sticker.model';

const props = defineProps({
	sticker: {
		type: Object as PropType<Sticker>,
		required: true,
	},
	count: {
		type: Number,
		default: undefined,
	},
	size: {
		type: Number,
		default: 64,
	},
	/**
	 * Ignores the {@link size} prop and instead sizes to the constraints of the
	 * parent, using a 1:1 ratio.
	 */
	fitParent: {
		type: Boolean,
	},
	/**
	 * Removes grab[bing] cursor styling.
	 */
	noDrag: {
		type: Boolean,
	},
	hideCount: {
		type: Boolean,
	},
	showCreator: {
		type: Boolean,
	},
	showMastery: {
		type: Boolean,
	},
});

const { sticker, count, size, fitParent, noDrag, hideCount } = toRefs(props);

const { streak, isDragging, sticker: storeSticker } = useStickerStore();

const displayCount = computed(() => count?.value || 0);

const currentStreak = computed(() => {
	if (streak.value?.sticker.id !== sticker.value.id) {
		return 0;
	}
	return streak.value.count;
});

const itemStyling = computed(() => {
	const sizeVal = fitParent.value ? '100%' : size.value + 'px';
	const result: StyleValue = {
		width: sizeVal,
		height: sizeVal,
	};

	if (!noDrag.value) {
		result.cursor = isDragging.value ? 'grabbing' : 'grab';
	}

	return result;
});

const isPeeled = computed(
	() =>
		storeSticker.value?.id === sticker.value.id ||
		(typeof count?.value === 'number' && count.value < 1)
);

// NOTE: Says unused for me, but it's in the template. Check before deleting.
const slotName = computed(() => (sticker.value.is_event ? 'above' : 'default'));

function onContextMenu(event: Event) {
	if (noDrag.value) {
		return;
	}
	event.preventDefault();
}

const tagStyles: CSSProperties = {
	...styleBorderRadiusLg,
	...styleElevate(1),
	backgroundColor: `rgba(0,0,0,0.87)`,
	position: `absolute`,
	zIndex: 1,
	padding: `4px 6px`,
	pointerEvents: `none`,
};
</script>

<template>
	<div class="-item" draggable="false" @contextmenu="onContextMenu">
		<component
			:is="fitParent ? AppAspectRatio : 'div'"
			:ratio="1"
			:style="
				styleWhen(!displayCount, {
					opacity: 0.3,
				})
			"
		>
			<component :is="sticker.is_event ? AppQuestFrame : 'div'" :style="itemStyling">
				<template #[slotName]>
					<div :class="{ '-peeled': isPeeled }">
						<AppStickerImg class="-img" :style="itemStyling" :src="sticker.img_url" />
					</div>
				</template>
			</component>
		</component>

		<div
			v-if="currentStreak > 1"
			:style="{
				...tagStyles,
				top: 0,
				right: 0,
			}"
		>
			<div class="-rarity">x{{ currentStreak }}</div>
		</div>

		<div
			v-if="!hideCount"
			:style="{
				...tagStyles,
				top: 0,
				left: 0,
				...styleWhen(!displayCount, {
					opacity: 0.3,
				}),
			}"
		>
			<div
				class="-rarity"
				:style="{
					color: sticker.rarityColor || 'white',
				}"
			>
				{{ displayCount }}
			</div>
		</div>

		<div
			v-if="showCreator && sticker.isCreatorSticker && sticker.owner_user"
			:style="{
				...styleChangeBg('bg-offset'),
				position: `absolute`,
				right: 0,
				bottom: 0,
				zIndex: 2,
				padding: kBorderWidthLg.px,
				borderRadius: `50%`,
				pointerEvents: `none`,
			}"
		>
			<AppUserAvatar
				:style="{
					width: `16px`,
					height: `16px`,
				}"
				:user="sticker.owner_user"
				disable-link
			/>
		</div>

		<template v-if="showMastery && typeof sticker.mastery === 'number'">
			<AppSpacer vertical :scale="1" />

			<div
				:style="{
					display: `flex`,
					alignItems: `center`,
					gap: `4px`,
					position: `relative`,
					padding: `0 4px`,
				}"
			>
				<div
					:style="{
						flex: `auto`,
						paddingTop: `4px`,
						paddingBottom: `4px`,
					}"
				>
					<div
						:style="{
							...styleBorderRadiusBase,
							width: `100%`,
							height: `4px`,
							position: `relative`,
							overflow: `hidden`,
							backgroundColor: kThemeFg10,
						}"
					>
						<div
							:style="{
								position: `absolute`,
								left: 0,
								top: 0,
								bottom: 0,
								right: `${Math.max(0, Math.min(100, 100 - sticker.mastery))}%`,
								backgroundColor: kThemePrimary,
							}"
						/>
					</div>
				</div>

				<AppJolticon
					v-if="sticker.mastery >= 100"
					icon="star"
					:style="{
						color: kThemePrimary,
						fontSize: `16px`,
						margin: 0,
						position: `absolute`,
						left: `50%`,
						top: `50%`,
						transform: `translate(-50%, -50%)`,
						backgroundColor: kThemeBgActual,
						borderRadius: `50%`,
						padding: `2px`,
					}"
				/>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-item
	position: relative
	user-drag: none
	user-select: none
	touch-action: none

.-peeled
	filter: contrast(0)

.-rarity
	font-weight: bold
	color: white
</style>
