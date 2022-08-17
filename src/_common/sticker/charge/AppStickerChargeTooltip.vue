<script lang="ts" setup>
import { computed, CSSProperties, PropType, ref, toRefs } from 'vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import { Ruler } from '../../ruler/ruler-service';
import { Screen } from '../../screen/screen-service';
import AppTranslate from '../../translate/AppTranslate.vue';
import { useStickerStore } from '../sticker-store';

const props = defineProps({
	/**
	 * HTMLElement that the tooltip will align itself to. Tooltip handles caret
	 * offset and other positioning by itself.
	 */
	caretElement: {
		type: Object as PropType<HTMLElement>,
		required: true,
	},
	/**
	 * HTMLElement that the tooltip can use for left/right positioning.
	 *
	 * If provided, the tooltip will attempt to position itself so that it spans
	 * the width of {@link widthTrackerElement}, even if the tooltip isn't a
	 * direct decendant of it.
	 *
	 * If undefined, the tooltip will try positioning itself in such a way that
	 * it's centered on the {@link caretElement} while staying within the bounds
	 * of the screen.
	 */
	widthTrackerElement: {
		type: Object as PropType<HTMLElement>,
		default: undefined,
	},
	show: {
		type: Boolean,
		required: true,
	},
	/**
	 * `position: fixed` instead of `absolute`.
	 */
	fixed: {
		type: Boolean,
	},
});

const { caretElement, widthTrackerElement, show, fixed } = toRefs(props);

const { chargeCost } = useStickerStore();

const root = ref<HTMLElement>();

const orbCostText = computed(() => {
	if (chargeCost.value === 1) {
		return `1 charge orb`;
	}
	return `${chargeCost.value} charge orbs`;
});

const tooltipPosition = computed<CSSProperties | null>(() => {
	const widthElement = widthTrackerElement?.value;
	const parent = root.value?.parentElement;

	const anchorOffset = Ruler.offset(caretElement.value);

	const widthTrackerOffset = widthElement ? Ruler.offset(widthElement) : null;
	const parentOffset = parent ? Ruler.offset(parent) : null;

	const {
		top: caretAnchorTop,
		height: caretAnchorHeight,
		width: caretWidth,
		left: caretLeft,
	} = anchorOffset;

	const { width: boundsWidth } = widthTrackerOffset || {};

	const baseBoundsLeft = widthTrackerOffset?.left;

	const {
		top: parentTop = caretAnchorTop,
		left: parentLeft = baseBoundsLeft,
		width: parentWidth = boundsWidth,
	} = parentOffset || {};

	const hasBounds = baseBoundsLeft !== undefined && boundsWidth !== undefined;

	let boundsLeft = baseBoundsLeft;
	if (hasBounds && !fixed.value) {
		boundsLeft = boundsLeft! - parentLeft!;
	}

	const boundsRight = hasBounds
		? widthTrackerOffset!.left + boundsWidth - (parentLeft! + parentWidth!)
		: undefined;

	const caretOffset = 11;
	// Scooch the tooltip a little closer to the caret so we don't show any gaps
	// due to rounding.
	const errorMargin = 1;

	// Start with the distance between the root top and the text top.
	let top = caretAnchorTop - (fixed.value ? 0 : parentTop) + caretAnchorHeight;

	// Line ourselves up with the edge of the caret, then back into it a little
	// so we don't leave a weird gap.
	top += caretOffset - errorMargin;

	const wantedScreenMargin = 8;
	const tooltipWidth = hasBounds
		? undefined
		: Math.min(Math.max(32, Screen.width - wantedScreenMargin * 2), 350);

	const result: CSSProperties = {
		position: fixed.value ? 'fixed' : 'absolute',
		top: `${top}px`,
		left: hasBounds ? `${boundsLeft}px` : undefined,
		right: hasBounds ? `${boundsRight}px` : undefined,
		width: tooltipWidth ? `${tooltipWidth}px` : undefined,
	};

	// No need for more position calculations.
	if (!tooltipWidth) {
		return result;
	}

	// Transform the tooltip so we're centered on the caret (when possible)
	// without overflowing the screen.
	const baseTooltipOffset = tooltipWidth / 2;

	const caretRight = caretLeft + caretWidth;
	const caretCenter = (caretLeft + caretRight) / 2;

	const wantedLeft = caretLeft + caretWidth / 2 - baseTooltipOffset;

	let translateResult = caretLeft - wantedLeft;

	const screenMarginRight = Screen.width - caretCenter - baseTooltipOffset;
	const screenMarginLeft = caretCenter - baseTooltipOffset;

	const needsNudgedRight = screenMarginLeft < wantedScreenMargin;
	const needsNudgedLeft = screenMarginRight < wantedScreenMargin;

	if (needsNudgedRight || needsNudgedLeft) {
		const strongerOverflow = Math.min(screenMarginLeft, screenMarginRight);
		const requiredMovement = Math.max(
			wantedScreenMargin,
			Math.abs(strongerOverflow) + wantedScreenMargin
		);

		// We translateX using negative px value, so to nudge this to the
		// right we need to subtract from our previous result.
		if (needsNudgedRight) {
			translateResult = translateResult - requiredMovement;
		} else {
			translateResult = translateResult + requiredMovement;
		}
	}

	result.transform = `translateX(${-translateResult}px)`;
	return result;
});
</script>

<template>
	<div
		v-if="show && tooltipPosition"
		ref="root"
		class="sticker-charge-tooltip"
		:style="tooltipPosition"
	>
		<p>
			<AppTranslate>
				Complete daily quests to fill your charge orbs. Each day you miss a daily, your
				charge goes down.
			</AppTranslate>
		</p>

		<div>
			<span>
				Once all your charge orbs are full, you can support your favorite Game Jolt Creators
			</span>

			<!-- TODO(charged-stickers) get the real icon -->
			<AppJolticon icon="friends" />

			<span>
				by giving them a charged sticker! Every charged sticker uses
				{{ orbCostText }} and puts 💰💰💰 in their IRL pockets.
			</span>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.sticker-charge-tooltip
	rounded-corners-lg()
	background-color: black
	color: white
	padding: 12px 16px
	z-index: 2
	white-space: normal

	> *
		max-width: 100%
</style>
