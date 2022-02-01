<script lang="ts">
import { computed, defineComponent, h, toRefs, useSlots } from 'vue';
import { Screen } from '../../../_common/screen/screen-service';

const validOrder = ['main', 'left', 'right'];

function validateOrder(val: unknown) {
	return typeof val === 'string' && val.split(',').every(i => validOrder.includes(i));
}

export default defineComponent({
	props: {
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
	},
	setup(props) {
		const { xl, noLeft, noRight, order } = toRefs(props);
		const slots = useSlots();

		const hasLeftColumn = computed(() => !noLeft.value && Screen.isLg);
		const hasRightColumn = computed(() => !noRight.value);
		const shouldCombineColumns = computed(() => !noLeft.value && !Screen.isLg);

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

		return () => {
			const left = slots['left']?.() ?? [];
			const leftBottom = slots['left-bottom']?.() ?? [];
			const main = slots['default']?.() ?? [];
			const right = slots['right']?.() ?? [];

			const cols = {
				left: hasLeftColumn.value
					? h('div', { key: `left:${keySuffix.value}`, class: '-left' }, [
							...left,
							...leftBottom,
					  ])
					: undefined,

				main: h('div', { key: `main:${keySuffix.value}`, class: '-main' }, main),

				right: hasRightColumn.value
					? h('div', { key: `right:${keySuffix.value}`, class: '-right' }, [
							...(shouldCombineColumns.value ? left : []),
							...right,
							...(shouldCombineColumns.value ? leftBottom : []),
					  ])
					: undefined,
			};

			const orders = order.value.split(',') as (keyof typeof cols)[];
			const orderedCols = orders.map(i => cols[i]);

			return h(
				'div',
				{
					class: classes.value,
				},
				[h('div', { class: '-row' }, orderedCols)]
			);
		};
	},
});
</script>

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
.-row
	display: flex
	flex-direction: column

// On mobile the left/right columns show before main.
.-left
	order: 0

.-right
	order: 1

.-main
	order: 2

// On sm we keep them in same column, but set a max size and center the content.
@media $media-sm
	.-row
		align-items: center

	.-main
	.-left
	.-right
		width: ($container-sm / 12 * 10)

// Desktop sizes is where we break it out into different columns.
@media $media-md-up
	.-row
		flex-direction: row
		justify-content: center

	.-left
		flex: 1 0
		padding-right: $grid-gutter-width
		min-width: $percentage-3
		order: 0

	.-main
		-main-max-width(1)
		flex: 2 0
		order: 1

	.-right
		flex: 1 0
		padding-left: $grid-gutter-width
		min-width: $percentage-3
		order: 2

@media $media-lg
	.-main
		-main-max-width(2)
</style>
