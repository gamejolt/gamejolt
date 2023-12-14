<script lang="ts">
import { CSSProperties, PropType, computed, toRef, toRefs, watch } from 'vue';
import { ComponentProps } from '../../../_common/component-helpers';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/AppScrollAffix.vue';
import AppScrollScroller, { createScroller } from '../../../_common/scroll/AppScrollScroller.vue';
import { kGridGutterWidth } from '../../../_styles/variables';
import { kShellTopNavHeight } from '../../styles/variables';

const validOrder = ['main', 'left', 'right'];

function validateOrder(val: unknown) {
	return typeof val === 'string' && val.split(',').every(i => validOrder.includes(i));
}
</script>

<script lang="ts" setup>
const props = defineProps({
	xl: {
		type: Boolean,
	},
	noLeft: {
		type: Boolean,
	},
	noRight: {
		type: Boolean,
	},
	order: {
		type: String,
		default: 'main,left,right',
		validator: validateOrder,
	},
	/**
	 * Sticks the left and/or right columns to the top of the page when
	 * scrolling.
	 */
	stickySides: {
		type: [Boolean, Object] as PropType<boolean | { left?: boolean; right?: boolean }>,
		default: () => ({}),
	},
	/**
	 * Distance between the top of the page contents and the top of a column.
	 * Used to offset some things so the sticky sides don't shift around.
	 */
	stickySideTopMargin: {
		type: Number,
		default: undefined,
	},
	/**
	 * Prevents the sticky sides from sticking and the scroller from scrolling.
	 * Workaround for sticky side children rebuilding when {@link stickySides}
	 * changes.
	 */
	disableStickySides: {
		type: [Boolean, Object] as PropType<boolean | { left?: boolean; right?: boolean }>,
		default: () => ({}),
	},
});

const { xl, noLeft, noRight, order, stickySides, stickySideTopMargin, disableStickySides } =
	toRefs(props);

const scrollerLeft = createScroller();
const scrollerRight = createScroller();

watch(
	disableStickySides,
	async disableStickySides => {
		let disableLeft = false;
		let disableRight = false;
		if (disableStickySides === true) {
			disableLeft = true;
			disableRight = true;
		} else if (disableStickySides !== false) {
			disableLeft = disableStickySides.left === true;
			disableRight = disableStickySides.right === true;
		}

		// We need to manually scroll to the top when disabling sticky sides,
		// otherwise the scroller will be stuck wherever we left it.
		//
		// TODO(profile-scrunch) Either get smooth scroll working or do some
		// custom transition so it's less jarring.
		if (disableLeft) {
			scrollerLeft.scrollTo(0);
		}
		if (disableRight) {
			scrollerRight.scrollTo(0);
		}
	},
	{ immediate: true }
);

const hasLeftColumn = toRef(() => !noLeft.value && Screen.isLg);
const hasRightColumn = toRef(() => !noRight.value);
const shouldCombineColumns = toRef(() => !noLeft.value && !Screen.isLg);
const stickyTopMargin = toRef(() => stickySideTopMargin?.value ?? 0);

const stickySideData = toRef(() => {
	if (
		!Screen.isDesktop ||
		(!hasLeftColumn.value && !hasRightColumn.value) ||
		stickySides.value === false
	) {
		return {
			left: false,
			right: false,
		};
	}
	return {
		left: stickySides.value === true || stickySides.value.left,
		right: stickySides.value === true || stickySides.value.right,
	};
});

const disabledProps = toRef(() => {
	if (disableStickySides.value === false) {
		return {
			left: false,
			right: false,
		};
	}
	return {
		left: disableStickySides.value === true || disableStickySides.value.left,
		right: disableStickySides.value === true || disableStickySides.value.right,
	};
});

// Vue 2 tried as hard as possible not to have to recreate DOM
// elements and instead bind new vnodes to the same DOM elements.
// This was breaking when we resized and went from 2-col to 3-col,
// etc. If we instead always regenerate a new key when these
// properties change, then it actually recompiles into the DOM
// perfectly and we don't get any errors.
const keySuffix = computed(() =>
	[
		hasLeftColumn.value ? 'l' : '-',
		hasRightColumn.value ? 'r' : '-',
		shouldCombineColumns.value ? 'c' : '-',
		':' + order.value,
	].join('')
);

const scrollAffixProps = toRef(() => {
	return {
		// 1px so things can un-affix if needed.
		padding: stickyTopMargin.value + 1,
	} satisfies ComponentProps<typeof AppScrollAffix>;
});

const scrollerProps = toRef(() => {
	return {
		thin: true,
		overlay: true,
	} satisfies ComponentProps<typeof AppScrollScroller>;
});

const stickyScrollerStyles = computed<CSSProperties>(() => {
	return {
		marginTop: `-${stickyTopMargin.value}px`,
		paddingTop: `${stickyTopMargin.value}px`,
		paddingBottom: kGridGutterWidth.px,
		height: `calc(100vh - ${kShellTopNavHeight.px})`,
	};
});
</script>

<template>
	<div
		:class="{
			container: !xl,
			'container-xl': xl,
			'-no-left': !hasLeftColumn,
			'-no-right': !hasRightColumn,
		}"
	>
		<div class="_row">
			<template v-if="hasLeftColumn">
				<component
					:is="stickySideData.left ? AppScrollAffix : 'div'"
					:key="`left:${keySuffix}`"
					class="_left-container"
					v-bind="{
						...(stickySideData.left ? scrollAffixProps : {}),
						disabled: disabledProps.left,
					}"
				>
					<component
						:is="stickySideData.left ? AppScrollScroller : 'div'"
						class="_left-scroller"
						:style="stickySideData.left ? stickyScrollerStyles : {}"
						v-bind="{
							...scrollerProps,
							disabled: disabledProps.left,
							controller: stickySideData.left ? scrollerLeft : undefined,
						}"
					>
						<slot name="left" />
						<slot name="left-bottom" />
					</component>
				</component>
			</template>

			<div :key="`main:${keySuffix}`" class="_main">
				<slot name="default" />
			</div>

			<template v-if="hasRightColumn">
				<component
					:is="stickySideData.right ? AppScrollAffix : 'div'"
					:key="`right:${keySuffix}`"
					class="_right-container"
					v-bind="{
						...(stickySideData.right ? scrollAffixProps : {}),
						disabled: disabledProps.right,
					}"
				>
					<component
						:is="stickySideData.right ? AppScrollScroller : 'div'"
						class="_right-scroller"
						:style="stickySideData.right ? stickyScrollerStyles : {}"
						v-bind="{
							...scrollerProps,
							disabled: disabledProps.right,
							controller: stickySideData.right ? scrollerRight : undefined,
						}"
					>
						<slot v-if="shouldCombineColumns" name="left" />
						<slot name="right" v-bind="{ combined: shouldCombineColumns }" />
						<slot v-if="shouldCombineColumns" name="left-bottom" />
					</component>
				</component>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
// On xs the content stacks, we shove "main" to the bottom.
._row
	display: flex
	flex-direction: column

// On mobile the left/right columns show before main.
._left-container
	min-width: 0
	order: 0

._right-container
	min-width: 0
	order: 1

._main
	min-width: 0
	order: 2

// On sm we keep them in same column, but set a max size and center the content.
@media $media-sm
	._row
		align-items: center

	._main
	._left-container
	._right-container
		width: ($container-sm / 12 * 10)

// Desktop sizes is where we break it out into different columns.
@media $media-md-up
	._row
		flex-direction: row
		justify-content: center
		margin-left: -($grid-gutter-width * 0.5)
		margin-right: -($grid-gutter-width * 0.5)

	._main
	._left-scroller
	._right-scroller
		padding-left: $grid-gutter-width * 0.5
		padding-right: $grid-gutter-width * 0.5

	._left-container
		flex: 1 0
		order: 0

	._main
		flex: 2 0
		order: 1
		max-width: 650px + $grid-gutter-width

	._right-container
		flex: 1 0
		order: 2
</style>
