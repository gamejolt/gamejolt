import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { Screen } from '../screen/screen-service';
import { Scroll } from '../scroll/scroll.service';

const ExtraCollapsePadding = 200;

/**
 * If the collapsed version would only leave this much pixels to expand it won't
 * collapse.
 */
const Threshold = 50;

@Component({})
export default class AppFadeCollapse extends Vue {
	@Prop(Number)
	collapseHeight!: number;

	@Prop(Boolean)
	isOpen?: boolean;

	@Prop({ type: Boolean, default: true })
	animate?: boolean;

	@Prop(String)
	size?: 'sm';

	isCollapsed = false;
	private isPrimed = false;
	private frameRequestHandle?: number = undefined;
	private isRequired = false;

	$el!: HTMLDivElement;

	@Emit('require-change')
	emitRequireChange(_isRequired: boolean) {}

	@Emit('expand')
	emitExpand(_e: Event) {}

	async mounted() {
		// Let it compile DOM.
		await this.$nextTick();

		// Take threshold into account only if our collapse height is big enough
		// for threshold to matter.
		const threshold = this.collapseHeight > Threshold * 2 ? Threshold : 0;

		if (this.collapseHeight && this.$el.scrollHeight - threshold > this.collapseHeight) {
			this.isRequired = true;
		}

		this.emitRequireChange(this.isRequired);

		if (this.isRequired && !this.isOpen) {
			this.collapse();
		}
	}

	@Watch('isOpen')
	isOpenChanged() {
		if (!this.isRequired) {
			return;
		}

		if (this.isOpen) {
			this.expand();
		} else {
			this.collapse();
		}

		this.isPrimed = true;
	}

	/**
	 * Called when the fade at the bottom is clicked on. We want to open it up in that case so that
	 * they can actually click on what's below.
	 */
	fadeClick(e: Event) {
		this.emitExpand(e);
	}

	expand() {
		this.isCollapsed = false;
		this.$el.style.maxHeight = this.$el.scrollHeight + 'px';
	}

	collapse() {
		this.isCollapsed = true;
		this.$el.style.maxHeight = this.collapseHeight + 'px';

		if (this.isPrimed) {
			// We will scroll to the bottom of the element minus some extra padding.
			// This keeps the element in view a bit.
			const scrollTo =
				Scroll.getElementOffsetTopFromContext(this.$el) +
				this.collapseHeight -
				ExtraCollapsePadding;

			// Only if we're past where we would scroll.
			if (Scroll.getScrollTop() > scrollTo) {
				// If we're on a tiny screen, don't animate the scroll.
				// Just set it and move on.
				if (Screen.isXs || !this.animate) {
					Scroll.to(scrollTo, { animate: false });
				} else {
					// Otherwise set up a scroll animation to follow the bottom of the element as it collapses.
					this.setupScrollAnim();
				}
			}
		}
	}

	setupScrollAnim() {
		// Start the loop.
		this.frameRequestHandle = window.requestAnimationFrame(() => this.animStep());
	}

	private animStep() {
		// Bottom of element from the scroll context top.
		// We then subtract some padding so that they still see some of the element while scrolling.
		const curPos =
			Scroll.getElementOffsetTopFromContext(this.$el) +
			this.$el.offsetHeight -
			ExtraCollapsePadding;

		// Only scroll if we have to.
		// This will allow the element to collapse freely until our marker would go out of view.
		// Then we scroll.
		if (Scroll.getScrollTop() > curPos) {
			Scroll.to(curPos, { animate: false });
		}

		// Request another frame to loop again.
		this.frameRequestHandle = window.requestAnimationFrame(() => this.animStep());
	}

	// This gets called after any of our maxHeight transitions.
	afterTransition() {
		// If we are doing the collapse scroll animation, then we can stop the
		// animation handler.
		if (this.frameRequestHandle) {
			window.cancelAnimationFrame(this.frameRequestHandle);
			this.frameRequestHandle = undefined;
		}
	}
}
