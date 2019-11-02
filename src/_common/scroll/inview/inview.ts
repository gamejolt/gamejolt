import Vue, { CreateElement } from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../utils/vue';
import { AppScrollInviewParent } from './parent';

@Component({})
export class AppScrollInview extends Vue {
	@Prop({ type: String, default: 'div' })
	tag!: string;

	/**
	 * The margin will effectively get added to the bounding box of this element
	 * to make it larger or smaller. It should be in the format of a CSS margin
	 * property and always have the "px" after each value.
	 */
	@Prop({ type: String, default: '0px' })
	margin!: string;

	/**
	 * The strict prop will cause the outview event to trigger when any part of
	 * the element is out of view, instead of requiring the whole element to be
	 * out of view.
	 */
	@Prop({ type: Boolean, default: false })
	strict!: boolean;

	// This will get set by AppScrollInviewContainer as this element goes into
	// and out of view.
	inView = false;

	private get parent() {
		return findRequiredVueParent(this, AppScrollInviewParent);
	}

	private get container() {
		return this.parent.getContainer(this.margin);
	}

	@Emit('inview') emitInView() {}
	@Emit('outview') emitOutView() {}

	@Watch('inView')
	inViewChanged() {
		if (this.inView) {
			this.emitInView();
		} else {
			this.emitOutView();
		}
	}

	mounted() {
		this.container.observeItem(this);
	}

	destroyed() {
		this.container.unobserveItem(this);
	}

	render(h: CreateElement) {
		return h(this.tag, this.$slots.default);
	}
}
