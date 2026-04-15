<script lang="ts" setup>
import { computed, CSSProperties, HTMLAttributes, StyleValue } from 'vue';

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
import { StickerModel } from '../sticker.model';
import { useStickerStore } from '../sticker-store';

type Props = {
	sticker: StickerModel;
	count?: number;
	size?: number;
	/**
	 * Ignores the {@link size} prop and instead sizes to the constraints of the
	 * parent, using a 1:1 ratio.
	 */
	fitParent?: boolean;
	/**
	 * Removes grabbing cursor styling.
	 */
	noDrag?: boolean;
	hideCount?: boolean;
	showCreator?: boolean;
	showMastery?: boolean;
	creatorSize?: number;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onMousedown' | 'onTouchstart'>;

const {
	sticker,
	count,
	size = 64,
	fitParent,
	noDrag,
	hideCount,
	showCreator,
	showMastery,
	creatorSize = 16,
} = defineProps<Props>();

const { streak, isDragging, sticker: storeSticker } = useStickerStore();

const displayCount = computed(() => count || 0);
const shouldFade = computed(() => {
	if (hideCount) {
		return false;
	}
	return !displayCount.value;
});

const currentStreak = computed(() => {
	if (streak.value?.sticker.id !== sticker.id) {
		return 0;
	}
	return streak.value.count;
});

const itemStyling = computed(() => {
	const itemSize = fitParent ? '100%' : `${size}px`;
	const result: StyleValue = {
		width: itemSize,
		height: itemSize,
	};
	if (!noDrag) {
		result.cursor = isDragging.value ? 'grabbing' : 'grab';
	}
	return result;
});

const isPeeled = computed(
	() =>
		storeSticker.value?.id === sticker.id ||
		(typeof count === 'number' && count < 1)
);

// NOTE: Says unused for me, but it's in the template. Check before deleting.
const slotName = computed(() => (sticker.is_event ? 'above' : 'default'));

function onContextMenu(event: Event) {
	if (noDrag) {
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
