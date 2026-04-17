<script lang="ts" setup>
import { computed, CSSProperties, HTMLAttributes, StyleValue } from 'vue';

import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppQuestFrame from '~common/quest/AppQuestFrame.vue';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import AppStickerImg from '~common/sticker/AppStickerImg.vue';
import AppStickerMastery from '~common/sticker/AppStickerMastery.vue';
import { StickerModel } from '~common/sticker/sticker.model';
import { useStickerStore } from '~common/sticker/sticker-store';
import AppUserAvatar from '~common/user/user-avatar/AppUserAvatar.vue';
import { kElevateTransition } from '~styles/mixins';
import { kBorderWidthLg } from '~styles/variables';

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
	() => storeSticker.value?.id === sticker.id || (typeof count === 'number' && count < 1)
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
	boxShadow: `var(--shadow-elevate-xs)`,
	transition: kElevateTransition,
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
			:class="{ 'opacity-30': shouldFade }"
		>
			<component :is="sticker.is_event ? AppQuestFrame : 'div'" :style="itemStyling">
				<template #[slotName]>
					<div
						:class="{ '[filter:contrast(0)]': isPeeled }"
						:style="{
							...itemStyling,
							padding: sticker.is_event ? `${size * 0.1}px` : undefined,
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
			class="rounded-lg"
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
			class="rounded-lg"
			:class="{ 'opacity-30': shouldFade }"
			:style="{
				...tagStyles,
				top: 0,
				left: 0,
			}"
		>
			{{ displayCount }}
		</div>

		<div
			v-if="showCreator && sticker.isCreatorSticker && sticker.owner_user"
			class="change-bg-bg-offset"
			:style="{
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
