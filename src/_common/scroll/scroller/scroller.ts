import SimpleBar from 'simplebar';
import 'simplebar/dist/simplebar.css';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ScrollInviewContainer } from '../inview/container';
import { AppScrollInviewParent } from '../inview/parent';
import { ScrollWatcher } from '../watcher.service';

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

	@Prop(Number)
	inviewThrottle?: number;

	@Prop(Number)
	inviewVelocity?: number;

	isMounted = GJ_IS_SSR;
	private scrollElement!: HTMLElement;

	// No watching.
	_simplebar?: SimpleBar;
	_scrollWatcher!: ScrollWatcher;
	_inviewContainer!: ScrollInviewContainer = null as any;
	private _isDestroyed?: boolean;

	$el!: HTMLDivElement;

	get shouldOverlay() {
		return this.overlay && !GJ_IS_SSR;
	}

	mounted() {
		// Don't set it up if it's already destroyed.
		if (this._isDestroyed) {
			return;
		}

		// The scrollable element will change if we are using simplebar.
		this.scrollElement = this.$el;
		if (this.shouldOverlay) {
			this._simplebar = new SimpleBar(this.scrollElement, {
				wrapContent: false,
				scrollbarMinSize: 30,
				// Only autohide vertical scrollbars since they're easy to scroll with a
				// mouse/trackpad.
				autoHide: !this.horizontal,
			});

			this.scrollElement = this._simplebar.getScrollElement() as HTMLDivElement;
		}

		// We need to create the inview container before we can put the content
		// into the DOM. This way we can pass the container to the inview parent
		// component so that it has the correct scroller.
		this._scrollWatcher = new ScrollWatcher(this.scrollElement);
		this._inviewContainer = new ScrollInviewContainer(
			this._scrollWatcher,
			this.inviewThrottle,
			this.inviewVelocity
		);

		this.isMounted = true;
	}

	scrollTo(offsetY: number) {
		this.scrollElement.scrollTo({ top: offsetY });
	}

	/**
	 * Can be used by parent components to queue a check against the inview
	 * container.
	 */
	queueInviewCheck() {
		if (this._inviewContainer) {
			this._inviewContainer.queueCheck();
		}
	}

	destroyed() {
		this._isDestroyed = true;
		this._simplebar = undefined;
	}
}
