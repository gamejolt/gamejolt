import SimpleBar from 'simplebar';
import 'simplebar/dist/simplebar.css';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppScrollInviewParent } from '../inview/parent';

@Component({
	components: {
		AppScrollInviewParent,
	},
})
export default class AppScrollScroller extends Vue {
	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	horizontal?: boolean;

	@Prop(Boolean)
	hideScrollbar?: boolean;

	isMounted = GJ_IS_SSR;

	// Underscored so that vue doesn't watch.
	private _scrollElement!: HTMLElement;
	private _isDestroyed?: boolean;
	_simplebar?: SimpleBar;

	get shouldOverlay() {
		return this.overlay && !GJ_IS_SSR;
	}

	/**
	 * The actual Element that scrolls for this Scroller.
	 */
	get scrollElement() {
		return this._scrollElement;
	}

	mounted() {
		// Don't set it up if it's already destroyed.
		if (this._isDestroyed) {
			return;
		}

		// The scrollable element will be different if we are using simplebar.
		this._scrollElement = this.$el as HTMLDivElement;
		if (this.shouldOverlay) {
			this._simplebar = new SimpleBar(this._scrollElement, {
				wrapContent: false,
				scrollbarMinSize: 30,
				// Only autohide vertical scrollbars since they're easy to scroll with a
				// mouse/trackpad.
				autoHide: !this.horizontal,
			});

			// Change the scrollable element to the simplebar one.
			this._scrollElement = this._simplebar.getScrollElement() as HTMLDivElement;
		}

		this.isMounted = true;
	}

	scrollTo(offsetY: number) {
		this._scrollElement.scrollTo({ top: offsetY });
	}

	destroyed() {
		this._isDestroyed = true;
		this._simplebar = undefined;
	}
}
