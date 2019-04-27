import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

const validOrder = ['main', 'left', 'right'];

function validateOrder(val: string) {
	return val.split(',').every(i => validOrder.includes(i));
}

@Component({})
export default class AppPageContainer extends Vue {
	@Prop(Boolean)
	xl?: number;

	@Prop(Boolean)
	noLeft?: boolean;

	@Prop(Boolean)
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
	render(h: CreateElement) {
		// wtf is this formatting?
		const cols = {
			left: this.hasLeftColumn
				? h('div', { staticClass: '-left' }, [
						this.$slots['left'],
						this.$slots['left-bottom'],
				  ])
				: null,
			main: h('div', { staticClass: '-main' }, this.$slots['default']),
			right: this.hasRightColumn
				? h('div', { staticClass: '-right' }, [
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
