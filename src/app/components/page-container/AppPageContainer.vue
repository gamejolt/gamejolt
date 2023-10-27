<script lang="ts">
import { CSSProperties, computed, toRef, toRefs } from 'vue';
import { ComponentProps } from '../../../_common/component-helpers';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/AppScrollAffix.vue';
import AppScrollScroller from '../../../_common/scroll/AppScrollScroller.vue';
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
		type: Boolean,
	},
	/**
	 * Distance between the top of the page contents and the top of a column.
	 * Used to offset some things so the sticky sides don't shift around.
	 */
	stickySideTopMargin: {
		type: Number,
		default: undefined,
	},
});

const { xl, noLeft, noRight, order, stickySides, stickySideTopMargin } = toRefs(props);

const hasLeftColumn = toRef(() => !noLeft.value && Screen.isLg);
const hasRightColumn = toRef(() => !noRight.value);
const shouldCombineColumns = toRef(() => !noLeft.value && !Screen.isLg);
const useStickySides = toRef(
	() => stickySides.value && Screen.isDesktop && (hasLeftColumn.value || hasRightColumn.value)
);
const stickyTopMargin = toRef(() => stickySideTopMargin?.value ?? 0);

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

const scrollAffixProps = computed<ComponentProps<typeof AppScrollAffix>>(() => {
	return {
		// 1px so things can un-affix if needed.
		padding: stickyTopMargin.value + 1,
	};
});

const scrollerStyles = computed<CSSProperties>(() => {
	if (!useStickySides.value) {
		return {};
	}

	return {
		marginTop: `-${stickyTopMargin.value}px`,
		paddingTop: `${stickyTopMargin.value}px`,
		paddingBottom: kGridGutterWidth.px,
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
						class="_left-scroller"
						:style="scrollerStyles"
						thin
						overlay
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
					:is="useStickySides ? AppScrollAffix : 'div'"
					:key="`right:${keySuffix}`"
					class="_right-container"
					v-bind="scrollAffixProps"
				>
					<component
						:is="useStickySides ? AppScrollScroller : 'div'"
						class="_right-scroller"
						:style="scrollerStyles"
						thin
						overlay
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
	order: 0

._right-container
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
		max-width: 650px

	._right-container
		flex: 1 0
		order: 2
</style>
