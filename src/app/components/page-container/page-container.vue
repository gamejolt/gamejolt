<script lang="ts">
import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Screen } from '../../../_common/screen/screen-service';

const validOrder = ['main', 'left', 'right'];

function validateOrder(val: unknown) {
	return typeof val === 'string' && val.split(',').every(i => validOrder.includes(i));
}

@Options({})
export default class AppPageContainer extends Vue {
	@Prop({ type: Boolean, required: false })
	xl?: boolean;

	@Prop({ type: Boolean, required: false })
	noLeft?: boolean;

	@Prop({ type: Boolean, required: false })
	noRight?: boolean;

	/**
	 * This controls the order that the content will show in the DOM, not
	 * visually. This is so we can prioritize the more important content for SEO
	 * and screen readers.
	 */
	@Prop({
		type: String,
		default: 'main,left,right',
		validator: validateOrder,
	})
	order!: string;

	get hasLeftColumn() {
		return !this.noLeft && Screen.isLg;
	}

	get hasRightColumn() {
		return !this.noRight;
	}

	get shouldCombineColumns() {
		return !this.noLeft && !Screen.isLg;
	}

	get classes() {
		return {
			container: !this.xl,
			'container-xl': this.xl,
			'-no-left': !this.hasLeftColumn,
			'-no-right': !this.hasRightColumn,
		};
	}

	// We do this in a render function so that we can change the order of
	// content.
	render() {
		// Vue tries as hard as possible not to have to recreate DOM elements
		// and instead bind new vnodes to the same DOM elements. This was
		// breaking when we resized and went from 2-col to 3-col, etc. If we
		// instead always regenerate a new key when these properties change,
		// then it actually recompiles into the DOM perfectly and we don't get
		// any errors.
		const keySuffix = [
			this.hasLeftColumn ? 'l' : '-',
			this.hasRightColumn ? 'r' : '-',
			this.shouldCombineColumns ? 'c' : '-',
			':' + this.order,
		].join('');

		const left = this.$slots['left']?.() ?? [];
		const leftBottom = this.$slots['left-bottom']?.() ?? [];
		const main = this.$slots['default']?.() ?? [];
		const right = this.$slots['right']?.() ?? [];

		const cols = {
			left: this.hasLeftColumn
				? h('div', { key: `left:${keySuffix}`, class: '-left' }, [...left, ...leftBottom])
				: undefined,

			main: h('div', { key: `main:${keySuffix}`, class: '-main' }, main),

			right: this.hasRightColumn
				? h('div', { key: `right:${keySuffix}`, class: '-right' }, [
						...(this.shouldCombineColumns ? left : []),
						...right,
						...(this.shouldCombineColumns ? leftBottom : []),
				  ])
				: undefined,
		};

		const order = this.order.split(',') as (keyof typeof cols)[];
		const orderedCols = order.map(i => cols[i]);

		return h(
			'div',
			{
				class: this.classes,
			},
			[h('div', { class: '-row' }, orderedCols)]
		);
	}
}
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
