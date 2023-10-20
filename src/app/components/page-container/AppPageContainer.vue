<script lang="ts">
import { CSSProperties, computed, toRefs } from 'vue';
import { ComponentProps } from '../../../_common/component-helpers';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/AppScrollAffix.vue';
import AppScrollScroller from '../../../_common/scroll/AppScrollScroller.vue';
import { kGridGutterWidth, kGridGutterWidthXs } from '../../../_styles/variables';
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
		type: Boolean,
	},
	/**
	 * Distance between the top of the page contents and the top of a column. Used to offset some things so we
	 */
	stickySideTopMargin: {
		type: Number,
		default: undefined,
	},
});

const { xl, noLeft, noRight, order, stickySides, stickySideTopMargin } = toRefs(props);

const hasLeftColumn = computed(() => !noLeft.value && Screen.isLg);
const hasRightColumn = computed(() => !noRight.value);
const shouldCombineColumns = computed(() => !noLeft.value && !Screen.isLg);
const useStickySides = computed(
	() => stickySides.value && Screen.isDesktop && (hasLeftColumn.value || hasRightColumn.value)
);

const classes = computed(() => {
	return {
		container: !xl.value,
		'container-xl': xl.value,
		'-no-left': !hasLeftColumn.value,
		'-no-right': !hasRightColumn.value,
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

const padding = computed(() => stickySideTopMargin?.value ?? 0);

const scrollAffixProps = computed<ComponentProps<typeof AppScrollAffix>>(() => {
	return {
		padding: padding.value + 1,
	};
});

const scrollerStyles = computed<CSSProperties>(() => {
	if (!useStickySides.value) {
		return {};
	}

	return {
		marginTop: `-${padding.value}px`,
		paddingTop: `${padding.value}px`,
		paddingBottom: `${Screen.isXs ? kGridGutterWidthXs.px : kGridGutterWidth.px}`,
		height: `calc(100vh - ${kShellTopNavHeight.px})`,
	};
});
</script>

<template>
	<div :class="classes">
		<div class="_row">
			<template v-if="hasLeftColumn">
				<component
					:is="useStickySides ? AppScrollAffix : 'div'"
					:key="`left:${keySuffix}`"
					class="_left-container"
					v-bind="scrollAffixProps"
				>
					<component
						:is="useStickySides ? AppScrollScroller : 'div'"
						class="_left"
						:style="scrollerStyles"
						thin
					>
						<slot name="left" />
						<slot name="left-bottom" />
					</component>
				</component>
			</template>

			<div :key="`main:${keySuffix}`" class="_main-container">
				<slot name="default" />
			</div>

			<template v-if="hasRightColumn">
				<component
					:is="useStickySides ? AppScrollAffix : 'div'"
					:key="`right:${keySuffix}`"
					class="_right-container"
					:class="{
						'_scrollbar-fix': useStickySides,
					}"
					v-bind="scrollAffixProps"
				>
					<component
						:is="useStickySides ? AppScrollScroller : 'div'"
						class="_right"
						:class="{
							'_scrollbar-fix': useStickySides,
						}"
						:style="scrollerStyles"
						thin
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
$-main-max-width = 650px

// Because flexbox allows the columns to flexibly size, we need to do a manual
// cut-off by setting the width forcefully. This calc line basically tries to
// find the correct width for the main content column and should work at any
// screen width since it's using calc() with the percentage.
-main-max-width($-num-columns)
	width: s('calc(100% - calc(100% / 12 * 3 * %s) - %s)', $-num-columns, ($grid-gutter-width * $-num-columns))
	max-width: $-main-max-width

// On xs the content stacks, we shove "main" to the bottom.
._row
	display: flex
	flex-direction: column

// On mobile the left/right columns show before main.
._left-container
	order: 0

._right-container
	order: 1

._main-container
	order: 2

// On sm we keep them in same column, but set a max size and center the content.
@media $media-sm
	._row
		align-items: center

	._main-container
	._left
	._right
		width: ($container-sm / 12 * 10)

// Desktop sizes is where we break it out into different columns.
@media $media-md-up
	._row
		flex-direction: row
		justify-content: center

	._left-container
		flex: 1 0
		order: 0
		min-width: $percentage-3
		// Padding is split between inner and outer elements so that the
		// scrollbar is aligned a bit better.
		padding-right: $grid-gutter-width * 0.5

	._left
		padding-right: $grid-gutter-width * 0.5

	._main-container
		-main-max-width(1)
		flex: 2 0
		order: 1

	._right-container
		flex: 1 0
		order: 2
		min-width: $percentage-3
		padding-left: $grid-gutter-width

		&._scrollbar-fix
			padding-left: $grid-gutter-width * 0.5

	// Adjust padding to help prevent weird scrollbar contact.
	._right._scrollbar-fix
		padding-left: $grid-gutter-width * 0.25
		padding-right: $grid-gutter-width * 0.25

@media $media-lg
	._main-container
		-main-max-width(2)

// Fixes visual glitches when going from md to sm/xs breakpoints.
//
// ScreenService breakpoints are slower than media queries, so sizing and
// AppScrollAffix things aren't triggered at the same time. This fix prevents a
// strobe-like effect when switching between these breakpoints.
@media $media-mobile
	._right._scrollbar-fix
		display: none
</style>
