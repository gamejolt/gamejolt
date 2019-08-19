import Vue, { CreateElement } from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Ruler } from '../../ruler/ruler-service';
import { Scroll } from '../scroll.service';

@Component({})
export class AppAutoscrollAnchor extends Vue {
	@Prop(Boolean)
	disabled?: boolean;

	/**
	 * Scroll anchor can stay on the page while the page content technically
	 * changes. For example, when switching between game pages the anchor
	 * component will be same, but we technically want to treat it like a new
	 * anchor. This checks to see if a particular prop changes, and if so it
	 * treats it like a new scroll anchor.
	 */
	@Prop()
	anchorKey!: any;

	/**
	 * We can't get the scroll top during the actual scroll behavior because
	 * DOM elements may no longer be in view which could affect scroll pos. We
	 * record the current scroll here before the route change so it's correct.
	 */
	scrollTo? = 0;

	keyChanged = false;

	private beforeRouteDeregister?: Function;

	$el!: HTMLDivElement;

	@Watch('anchorKey')
	onAnchorKeyChange() {
		this.keyChanged = true;
	}

	mounted() {
		Scroll.autoscrollAnchor = this;

		this.beforeRouteDeregister = this.$router.beforeEach((_to, _from, next) => {
			if (this.disabled) {
				this.scrollTo = 0;
			} else {
				const recordedScroll = Scroll.getScrollTop();

				// We only scroll to the anchor if they're scrolled past it currently.
				const offset = Ruler.offset(this.$el);
				if (recordedScroll > offset.top - Scroll.offsetTop) {
					// Scroll to the anchor.
					this.scrollTo = offset.top - Scroll.offsetTop;
				} else {
					// Don't scroll since they're above the anchor.
					this.scrollTo = undefined;
				}
			}

			next();
		});
	}

	destroyed() {
		Scroll.autoscrollAnchor = undefined;

		if (this.beforeRouteDeregister) {
			this.beforeRouteDeregister();
			this.beforeRouteDeregister = undefined;
		}
	}

	render(h: CreateElement) {
		return h('div', this.$slots.default);
	}
}
