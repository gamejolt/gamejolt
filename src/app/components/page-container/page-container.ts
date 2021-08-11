import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Screen } from '../../../_common/screen/screen-service';

const validOrder = ['main', 'left', 'right'];

function validateOrder(val: string) {
	return val.split(',').every(i => validOrder.includes(i));
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

		const cols = {
			left: this.hasLeftColumn
				? h('div', { key: `left:${keySuffix}`, staticClass: '-left' }, [
						this.$slots['left'],
						this.$slots['left-bottom'],
				  ])
				: null,
			main: h(
				'div',
				{ key: `main:${keySuffix}`, staticClass: '-main' },
				this.$slots['default']
			),
			right: this.hasRightColumn
				? h('div', { key: `right:${keySuffix}`, staticClass: '-right' }, [
						this.shouldCombineColumns ? this.$slots['left'] : null,
						this.$slots['right'],
						this.shouldCombineColumns ? this.$slots['left-bottom'] : null,
				  ])
				: null,
		};

		const orderedCols = this.order.split(',').map(i => (cols as any)[i]);

		return h(
			'div',
			{
				class: this.classes,
			},
			[h('div', { staticClass: '-row' }, orderedCols)]
		);
	}
}
