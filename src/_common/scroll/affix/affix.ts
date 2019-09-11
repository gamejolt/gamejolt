import 'rxjs/add/operator/sampleTime';
import { Subscription } from 'rxjs/Subscription';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { findVueParent } from '../../../utils/vue';
import { Ruler } from '../../ruler/ruler-service';
import { Screen } from '../../screen/screen-service';
import { Scroll } from '../scroll.service';
import AppScrollScrollerTS from '../scroller/scroller';
import AppScrollScroller from '../scroller/scroller.vue';

/**
 * Wait this long between scroll checks.
 */
const ScrollSampleTime = 100;

@Component({})
export default class AppScrollAffix extends Vue {
	@Prop({ type: String, default: 'gj-scroll-affixed' })
	className!: string;

	@Prop(Boolean)
	disabled!: boolean;

	@Prop(Number)
	scrollOffset?: number;

	@Prop({
		type: String,
		validator: i => ['top', 'bottom'].indexOf(i) !== -1,
		default: 'top',
	})
	anchor!: 'top' | 'bottom';

	isAffixed = false;
	placeholderHeight = 0;
	width = '';

	private refreshLoopCount = 0;
	private timeoutCancel?: NodeJS.Timer;

	private resize$: Subscription | undefined;
	private scroll$: Subscription | undefined;
	private clickHandler!: EventListener;
	private afterRouteDeregister?: Function;

	$refs!: {
		container: HTMLElement;
		placeholder: HTMLElement;
	};

	get cssClasses() {
		const classes = [];
		if (this.isAffixed) {
			classes.push(this.className);
		}

		if (this.anchor === 'top') {
			classes.push('-anchor-top');
		} else if (this.anchor === 'bottom') {
			classes.push('-anchor-bottom');
		}

		return classes;
	}

	private get scrollWatcher() {
		// We use any parent scrollers if there are any, otherwise use the root
		// scroll watcher.
		const scroller = findVueParent(this, AppScrollScroller) as AppScrollScrollerTS;
		return scroller ? scroller._scrollWatcher : Scroll.watcher;
	}

	private get scrollContext() {
		return this.scrollWatcher.context;
	}

	mounted() {
		// In case the click changed the page position, or changed element
		// positions.
		this.clickHandler = () => this.refreshOffsetLoop();
		document.addEventListener('click', this.clickHandler);

		// If we resized, then the element dimensions most likely changed.
		this.resize$ = Screen.resizeChanges.subscribe(() => {
			// Pull from the placeholder which should be the source of the true
			// width now.
			if (this.isAffixed) {
				const placeholder = this.$refs.placeholder;
				if (placeholder) {
					this.width = Ruler.outerWidth(placeholder) + 'px';
				}
			}

			this.refreshOffsetLoop();
		});

		// When routes change.
		this.afterRouteDeregister = this.$router.afterEach(() => this.refreshOffsetLoop());

		this.scroll$ = this.scrollWatcher.changes.sampleTime(ScrollSampleTime).subscribe(() => {
			const { top, height } = this.scrollWatcher.getScrollChange();
			this.checkScroll(top, height);
		});

		this.refreshOffsetLoop();
	}

	destroyed() {
		if (this.clickHandler) {
			document.removeEventListener('click', this.clickHandler);
		}

		this.cancelOffsetLoop();

		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}

		if (this.scroll$) {
			this.scroll$.unsubscribe();
			this.scroll$ = undefined;
		}

		if (this.afterRouteDeregister) {
			this.afterRouteDeregister();
			this.afterRouteDeregister = undefined;
		}
	}

	@Watch('disabled')
	onDisabledChange() {
		this.queueCheck();
	}

	// This sets up a loop that syncs repeatedly for a bit. This is needed if an
	// action is done that may have triggered an animation that would change
	// height of element.
	private refreshOffsetLoop() {
		this.cancelOffsetLoop();
		this.tickOffsetLoop();
	}

	private tickOffsetLoop() {
		this.timeoutCancel = setTimeout(() => {
			this.queueCheck();

			++this.refreshLoopCount;
			if (this.refreshLoopCount <= 6) {
				this.tickOffsetLoop();
			}
		}, 500);
	}

	private cancelOffsetLoop() {
		this.refreshLoopCount = 0;
		if (this.timeoutCancel) {
			clearTimeout(this.timeoutCancel);
			this.timeoutCancel = undefined;
		}
	}

	private async queueCheck() {
		// Let the view compile.
		await this.$nextTick();

		if (!this.disabled) {
			this.checkScroll();
		} else {
			this.off();
		}
	}

	private getOffset() {
		// We pull from the placeholder if it's attached. If we're scrolled
		// past, then the placeholder will have the correct position.
		let elem: HTMLElement;
		if (this.isAffixed) {
			const placeholder = this.$refs.placeholder;
			if (!placeholder) {
				throw new Error(`Couldn't find placeholder.`);
			}
			elem = placeholder;
		} else {
			elem = this.$refs.container;
		}

		let offset = 0;
		if (this.anchor === 'top') {
			offset = Scroll.getElementOffsetTopFromContext(elem);
		} else if (this.anchor === 'bottom') {
			offset = Scroll.getElementOffsetBottomFromContext(elem);
		}

		if (this.scrollContext !== document) {
			offset -= Scroll.getScrollTop();
		}

		if (this.scrollOffset) {
			offset -= this.scrollOffset;
		}

		return offset;
	}

	private checkScroll(offset?: number, height?: number) {
		if (this.disabled) {
			return;
		}

		// Pull from the correct scroll context.
		height = height !== undefined ? height : Scroll.getScrollWindowHeight(this.scrollContext);
		const scrollTop = offset !== undefined ? offset : Scroll.getScrollTop(this.scrollContext);
		const scrollBottom = scrollTop + height;
		let curOffset = this.getOffset();

		if (this.anchor === 'bottom') {
			curOffset += scrollTop;
		}

		const shouldAnchor =
			(this.anchor === 'top' && scrollTop > curOffset) ||
			(this.anchor === 'bottom' && scrollBottom < curOffset);

		// console.log(
		// 	'check scroll',
		// 	'top',
		// 	scrollTop,
		// 	'height',
		// 	height,
		// 	'bottom',
		// 	scrollBottom,
		// 	'offset',
		// 	curOffset
		// );

		if (!this.isAffixed && shouldAnchor) {
			const width = Ruler.outerWidth(this.$refs.container);
			const height = Ruler.outerHeight(this.$refs.container);

			this.placeholderHeight = height;
			this.isAffixed = true;
			this.width = width + 'px';

			this.$emit('change', true);
		} else if (!shouldAnchor) {
			this.off();
		}
	}

	private off() {
		if (this.isAffixed) {
			this.isAffixed = false;
			this.width = '';

			this.$emit('change', false);
		}
	}
}
