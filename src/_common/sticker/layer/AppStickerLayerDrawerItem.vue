<script lang="ts" setup>
import { computed, CSSProperties, PropType, StyleValue, toRefs } from 'vue';
import {
	styleBorderRadiusLg,
	styleChangeBg,
	styleElevate,
	styleWhen,
} from '../../../_styles/mixins';
import { kBorderWidthLg } from '../../../_styles/variables';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppQuestFrame from '../../quest/AppQuestFrame.vue';
import AppSpacer from '../../spacer/AppSpacer.vue';
import AppUserAvatar from '../../user/user-avatar/AppUserAvatar.vue';
import AppStickerImg from '../AppStickerImg.vue';
import AppStickerMastery from '../AppStickerMastery.vue';
import { useStickerStore } from '../sticker-store';
import { StickerModel } from '../sticker.model';

const props = defineProps({
	sticker: {
		type: Object as PropType<StickerModel>,
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
	 * Removes grabbing cursor styling.
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
	creatorSize: {
		type: Number,
		default: 16,
	},
});

const { sticker, count, size, fitParent, noDrag, hideCount } = toRefs(props);
const { streak, isDragging, sticker: storeSticker } = useStickerStore();

const displayCount = computed(() => count?.value || 0);
const shouldFade = computed(() => {
	if (hideCount.value) {
		return false;
	}
	return !displayCount.value;
});

const currentStreak = computed(() => {
	if (streak.value?.sticker.id !== sticker.value.id) {
		return 0;
	}
	return streak.value.count;
});

const itemStyling = computed(() => {
	const itemSize = fitParent.value ? '100%' : `${size.value}px`;
	const result: StyleValue = {
		width: itemSize,
		height: itemSize,
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
	fontWeight: `bold`,
	color: `white`,
};
</script>

<template>
	<div
		:style="{
			position: `relative`,
			userSelect: `none`,
		}"
		draggable="false"
		@contextmenu="onContextMenu"
	>
		<component
			:is="fitParent ? AppAspectRatio : 'div'"
			:ratio="1"
			:style="{
				...styleWhen(shouldFade, {
					opacity: 0.3,
				}),
			}"
		>
			<component :is="sticker.is_event ? AppQuestFrame : 'div'" :style="itemStyling">
				<template #[slotName]>
					<div
						:style="{
							...itemStyling,
							...styleWhen(isPeeled, {
								filter: `contrast(0)`,
							}),
							...styleWhen(sticker.is_event, {
								padding: `${size * 0.1}px`,
							}),
						}"
					>
						<AppStickerImg
							:style="{
								width: `100%`,
								height: `100%`,
							}"
							:src="sticker.img_url"
						/>
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
			x{{ currentStreak }}
		</div>

		<div
			v-if="!hideCount"
			:style="{
				...tagStyles,
				top: 0,
				left: 0,
				...styleWhen(shouldFade, {
					opacity: 0.3,
				}),
			}"
		>
			{{ displayCount }}
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
					width: `${creatorSize}px`,
					height: `${creatorSize}px`,
				}"
				:user="sticker.owner_user"
				disable-link
			/>
		</div>

		<template v-if="showMastery && typeof sticker.mastery === 'number'">
			<AppSpacer vertical :scale="1" />
			<AppStickerMastery :progress="sticker.mastery" />
		</template>
	</div>
</template>
