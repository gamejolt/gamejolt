import { Subscription } from 'rxjs/Subscription';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Ruler } from '../../ruler/ruler-service';
import { Screen } from '../../screen/screen-service';
import { Scroll } from '../scroll.service';

/**
 * Get's the element's top offset from the scroll context viewport.
 */
function getElementTop(element: HTMLElement, currentTransform: number) {
	let elementTop = Scroll.getElementOffsetTopFromContext(element);

	// If we've transformed the element already, we have to remove that transformation from the result.
	// This is because transforming changes the value returned by offset().
	if (currentTransform) {
		elementTop -= currentTransform;
	}

	return elementTop;
}

@Component({})
export class AppScrollParallax extends Vue {
	@Prop(Number)
	drag?: number;

	@Prop(Number)
	dim?: number;

	@Prop(Boolean)
	disabled?: boolean;

	private transform = 0;
	private opacity = 0;
	private initialOpacity = 1;
	private waitingForFrame = false;
	private posReset = false;
	private dimReset = false;

	private scroll$: Subscription | undefined;
	private resize$: Subscription | undefined;

	private elementHeight!: number;
	private elementTop!: number;
	private lastCalculated!: number;

	$el!: HTMLDivElement;

	async mounted() {
		this.scroll$ = Scroll.watcher.changes.subscribe(() => {
			const { top } = Scroll.watcher.getScrollChange();
			this.onScroll(top);
		});

		this.resize$ = Screen.resizeChanges.subscribe(() => this.onScroll(Scroll.getScrollTop()));

		const initialOpacity = this.$el.style.opacity;
		if (initialOpacity) {
			this.initialOpacity = parseFloat(initialOpacity);
		}

		await this.$nextTick();
		this.recalc();
	}

	render(h: CreateElement) {
		return h('div', { staticClass: 'scroll-parallax' }, this.$slots.default);
	}

	destroyed() {
		if (this.scroll$) {
			this.scroll$.unsubscribe();
			this.scroll$ = undefined;
		}

		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}
	}

	private recalc() {
		this.lastCalculated = Date.now();

		// The height of the scroller viewport.
		const scrollerHeight = Ruler.outerHeight(document);

		// The height of the element.
		this.elementHeight = Ruler.outerHeight(this.$el);

		// Get the element top. This is the offset from the top of the scroller viewport.
		this.elementTop = getElementTop(this.$el, this.transform);

		// If the element is taller than the scroller viewport, then add
		// extra spacing so that it doesn't start scrolling until the bottom of
		// the element is in view.
		if (this.elementHeight > scrollerHeight) {
			this.elementTop += this.elementHeight - scrollerHeight;
		}
	}

	private onScroll(scrollTop: number) {
		if (!this.waitingForFrame) {
			this.waitingForFrame = true;
			window.requestAnimationFrame(() => this.step(scrollTop));
		}
	}

	private step(scrollTop: number) {
		if (this.disabled) {
			return;
		}

		this.waitingForFrame = false;

		// Calculate stuff every 1s max.
		if (Date.now() - this.lastCalculated >= 1000) {
			this.recalc();
		}

		// The amount that we've scrolled PAST the element top.
		// This is the value that we do calculations on.
		let scrollDelta = 0;

		// If we are past the end of the scrolling/parallax effect, quit early.
		if (scrollTop > this.elementHeight + this.elementTop) {
			return;
		}

		// If we've scrolled past the element top, then we need to start calculating the parallax effect.
		if (scrollTop > this.elementTop) {
			scrollDelta = scrollTop - this.elementTop;
		} else {
			// If we haven't scrolled past yet (and are still in the top), make sure our current transform value
			// is reset.
			this.transform = 0;
			this.opacity = this.initialOpacity;
		}

		// If we have scroll drag, then we need to calculate the current transformation value.
		let transform: string | undefined;
		if (this.drag) {
			if (scrollDelta) {
				this.transform = scrollDelta * this.drag;
				transform = 'translate3d( 0, ' + this.transform + 'px' + ', 0 )';
				this.posReset = false;
			} else if (!this.posReset) {
				transform = 'translate3d( 0, 0, 0 )';
				this.posReset = true;
			}
		}

		// If we have scroll dimming then we need to calculate the current opacity value.
		let opacity: string | undefined;
		if (this.dim) {
			if (scrollDelta) {
				this.opacity = Math.max(
					0,
					this.initialOpacity - (scrollDelta / this.elementHeight) * this.dim
				);
				opacity = this.opacity + '';
				this.dimReset = false;
			} else if (!this.dimReset) {
				opacity = this.initialOpacity + '';
				this.dimReset = true;
			}
		}

		if (opacity) {
			this.$el.style.opacity = opacity;
		}

		if (transform) {
			this.$el.style.transform = transform;
		}
	}
}
