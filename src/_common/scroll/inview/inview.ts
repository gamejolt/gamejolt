import Vue, { CreateElement } from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../utils/vue';
import { AppScrollInviewParent } from './parent';

export type EmitsOn = 'full-overlap' | 'partial-overlap';

@Component({})
export class AppScrollInview extends Vue {
	@Prop({ type: String, default: 'div' })
	tag!: string;

	/**
	 * The margin will effectively get added to the bounding box of this element
	 * to make it larger or smaller. It should be in the format of a CSS margin
	 * property and always have the "px" after each value.
	 * Note: This is not reactive.
	 */
	@Prop({ type: String, default: '0px' })
	margin!: string;

	/**
	 * The emits-on prop determines when the inview and outview events emit. Possible values:
	 *	'partial-overlap' (default value)
	 *		inview - emits when the element comes partially in view.
	 *		outview - emits when the element goes completely out of view.
	 *	'full-overlap'
	 *		inview - emits when the element comes in view fully.
	 *		outview - emits when the element goes partially out of view.
	 */
	@Prop({ type: String, default: 'partial-overlap' })
	emitsOn!: EmitsOn;

	// This will get set by AppScrollInviewContainer as this element goes into
	// and out of view.
	inView: null | boolean = null;

	// This is the initial value of the margin prop.
	// The margin prop cannot be reactive because we can't easily
	// recreate the intersection observer at this point in time.
	initMargin = '0px';

	private get parent() {
		return findRequiredVueParent(this, AppScrollInviewParent);
	}

	private get container() {
		return this.parent.getContainer(this.initMargin);
	}

	// These will get called by ScrollInviewContainer.
	@Emit('inview') emitInView() {}
	@Emit('outview') emitOutView() {}

	mounted() {
		this.initMargin = this.margin;
		this.container.observeItem(this);
	}

	destroyed() {
		this.container.unobserveItem(this);
	}

	render(h: CreateElement) {
		return h(this.tag, this.$slots.default);
	}
}
