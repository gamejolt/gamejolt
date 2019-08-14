import Vue, { CreateElement } from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Scroll } from '../../../components/scroll/scroll.service';
import { arrayRemove } from '../../../utils/array';
import { findVueParent } from '../../../utils/vue';
import { ScrollInviewContainer } from './container';
import { AppScrollInviewParent } from './parent';

// This is the root container we use if there's no inview parent.
let BaseContainer: ScrollInviewContainer;
if (!GJ_IS_SSR) {
	BaseContainer = new ScrollInviewContainer(Scroll.watcher);
}

@Component({})
export class AppScrollInview extends Vue {
	@Prop({ type: String, default: 'div' })
	tag!: string;

	@Prop({ type: Number, default: 0 })
	extraPadding!: number;

	inView = false;

	// Don't have Vue watch these by not setting their default values.
	top!: number;
	bottom!: number;

	get container() {
		const parent = findVueParent(this, AppScrollInviewParent);
		return parent ? parent._container : BaseContainer;
	}

	async mounted() {
		// Wait for the parent container to bootstrap in.
		await this.$nextTick();
		this.container.items.push(this);

		// Queue a check so that we can group together all the other components that may mount in
		// and do one single check.
		this.container.queueCheck();
	}

	destroyed() {
		arrayRemove(this.container.items, i => i === this);
	}

	render(h: CreateElement) {
		return h(this.tag, this.$slots.default);
	}

	@Watch('inView')
	inViewChanged() {
		if (this.inView) {
			this.$emit('inview');
		} else {
			this.$emit('outview');
		}
	}

	recalcBox() {
		const rect = this.$el.getBoundingClientRect();
		let top = rect.top;

		if (this.container.context instanceof HTMLDocument) {
			top += window.pageYOffset || document.documentElement.scrollTop;
		} else if (!(this.container.context instanceof HTMLDocument)) {
			const parentRect = this.container.context.getBoundingClientRect();
			top -= parentRect.top;
			top += this.container.context.scrollTop;
		}

		this.top = top - this.extraPadding;
		this.bottom = top + rect.height + this.extraPadding;
	}
}
