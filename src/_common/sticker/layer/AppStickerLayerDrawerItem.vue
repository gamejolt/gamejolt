<script lang="ts" setup>
import { computed, CSSProperties, PropType, StyleValue, toRefs } from 'vue';
import {
	styleBorderRadiusBase,
	styleBorderRadiusCircle,
	styleBorderRadiusLg,
	styleChangeBg,
	styleElevate,
} from '../../../_styles/mixins';
import { kBorderWidthLg } from '../../../_styles/variables';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import AppQuestFrame from '../../quest/AppQuestFrame.vue';
import AppSpacer from '../../spacer/AppSpacer.vue';
import { kThemeFg, kThemeFg10, kThemePrimary } from '../../theme/variables';
import AppUserAvatar from '../../user/user-avatar/AppUserAvatar.vue';
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
		<component :is="fitParent ? AppAspectRatio : 'div'" :ratio="1">
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
			v-if="!hideCount && typeof count === 'number'"
			:style="{
				...tagStyles,
				top: 0,
				left: 0,
			}"
		>
			<div
				class="-rarity"
				:style="{
					color: sticker.rarityColor || 'white',
				}"
			>
				{{ count }}
			</div>
		</div>

		<div
			v-if="showCreator && sticker.isCreatorSticker && sticker.owner_user"
			:style="{
				...styleBorderRadiusCircle,
				...styleChangeBg('bg-offset'),
				position: `absolute`,
				right: 0,
				bottom: 0,
				zIndex: 2,
				padding: kBorderWidthLg.px,
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

		<!-- TODO(reactions) hover state -->
		<template v-if="showMastery && typeof sticker.mastery === 'number'">
			<AppSpacer vertical :scale="2" />

			<div
				:style="{
					display: `flex`,
					alignItems: `center`,
				}"
			>
				<div
					:style="{
						...styleBorderRadiusBase,
						flex: `auto`,
						position: `relative`,
						height: `4px`,
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

				<AppJolticon
					v-if="sticker.mastery >= 100"
					icon="star"
					:style="{
						color: kThemeFg,
						fontSize: `12px`,
						lineHeight: 0,
						marginLeft: `4px`,
						marginTop: 0,
						marginBottom: 0,
						marginRight: 0,
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
