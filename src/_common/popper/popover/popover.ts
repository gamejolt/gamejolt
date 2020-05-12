import { createPopper, Instance, Options } from '@popperjs/core';
import { OffsetModifier } from '@popperjs/core/lib/modifiers/offset';
import { PreventOverflowModifier } from '@popperjs/core/lib/modifiers/preventOverflow';
import ResizeObserver from 'resize-observer-polyfill';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { Backdrop } from '../../backdrop/backdrop.service';
import AppBackdrop from '../../backdrop/backdrop.vue';
import { Screen } from '../../screen/screen-service';
import AppScrollScroller from '../../scroll/scroller/scroller.vue';
import { Popover } from './popover.service';
import './popover.styl';

// Sync with the styles files.
const TransitionTime = 200;

let PopperIndex = 0;

type ActualTrigger = 'click' | 'hover' | 'manual';

@Component({
	components: {
		AppScrollScroller,
	},
})
export default class AppPopper extends Vue {
	@Prop(propOptional(String, 'bottom'))
	placement!: 'top' | 'right' | 'bottom' | 'left';

	@Prop(propOptional(String, 'absolute'))
	strategy!: 'fixed' | 'absolute';

	@Prop(propOptional(String, 'click'))
	trigger!: ActualTrigger | 'right-click';

	/**
	 * By default the popper will stay on the page until the user clicks outside
	 * of the popper. This tells the popper to close anytime the state changes.
	 * Useful for poppers in the shell that link to other pages on the site.
	 */
	@Prop(propOptional(Boolean))
	hideOnStateChange?: boolean;

	/**
	 * Whether or not the popper should size itself to the same width as the
	 * trigger. Useful for poppers that work like "select" type controls.
	 */
	@Prop(propOptional(Boolean))
	trackTriggerWidth?: boolean;

	/**
	 * Whether or not the popper should take up the full max width instead of
	 * relying on its content to size itself. Useful for poppers that change the
	 * content dynamically and you want it to stay one consistent size.
	 */
	@Prop(propOptional(Boolean))
	forceMaxWidth?: boolean;

	// @Prop()
	// delay?: any;

	@Prop(propOptional(Boolean))
	disabled?: boolean;

	// @Prop(Boolean)
	// show?: boolean;

	// @Prop({ type: Boolean, default: true })
	// autoHide!: boolean;

	@Prop(propOptional(Boolean))
	block?: boolean;

	// @Prop(String)
	// openGroup?: string;

	@Prop(propOptional(String, null))
	popoverClass!: null | string;

	$refs!: {
		popover: any;
		popper: any;
	};

	isHiding = false;
	isVisible = false;
	width = '';
	maxWidth = '';
	popperIndex = PopperIndex++;

	private _popperElement!: HTMLElement;
	ResizeObserver!: ResizeObserver | null;
	popperInstance!: Instance | null;
	// private _isDestroyed?: boolean;

	private hideTimeout?: NodeJS.Timer;
	private mobileBackdrop: AppBackdrop | null = null;

	get maxHeight() {
		return Screen.height - 100 + 'px';
	}

	get popperId() {
		return 'popper-' + this.popperIndex;
	}

	get actualTrigger(): ActualTrigger {
		return this.trigger === 'right-click' ? 'manual' : this.trigger;
	}

	get contentClass() {
		let classes = [this.popoverClass];
		if (this.trackTriggerWidth) {
			classes.push('-track-trigger-width');
		}
		if (this.forceMaxWidth) {
			classes.push('-force-max-width');
		}
		return classes.join(' ');
	}

	get popperOptions(): Options {
		return {
			placement: this.placement,
			modifiers: [
				{
					// offset between popper and trigger
					name: 'offset',
					options: {
						offset: [0, 12],
					},
				} as OffsetModifier,
				{
					// padding between popper and viewport
					name: 'preventOverflow',
					options: {
						padding: 8,
					},
				} as PreventOverflowModifier,
			],
			strategy: this.strategy,
		};
	}

	mounted() {
		Popover.registerPopper(this.$router, this);
		this._popperElement = this.$el as HTMLDivElement;
	}

	destroyed() {
		Popover.deregisterPopper(this);
		this.clearHideTimeout();
		this.removeBackdrop();
	}

	triggerClicked() {
		if (this.isVisible) {
			return this.onHide();
		}

		return this.onShow();
	}

	async createPopper() {
		this.isVisible = true;
		await this.$nextTick();

		this.popperInstance = createPopper(
			this._popperElement,
			this.$refs.popper,
			this.popperOptions
		);

		this.ResizeObserver = new ResizeObserver(() => {
			if (this.popperInstance) {
				this.popperInstance.forceUpdate();
			}
		});
		this.ResizeObserver.observe(this.$refs.popper);
		console.log(this.popperInstance);
	}

	@Emit('show')
	onShow() {
		this.clearHideTimeout();
		this.createPopper();

		// If we are tracking a particular element's width, then we set this popover to be the same
		// width as the element. We don't track width when it's an XS screen since we do a full
		// width popover in those cases.
		let widthElem: HTMLElement | undefined;
		if (this.trackTriggerWidth && !Screen.isWindowXs) {
			widthElem = document.querySelector('#' + this.popperId) as HTMLElement | undefined;
			if (widthElem) {
				this.width = widthElem.offsetWidth + 'px';
				this.maxWidth = 'none';
			}
		}

		// If no element to base our width on, reset.
		if (!widthElem) {
			this.maxWidth = '';
			this.width = '';
		}

		this.addBackdrop();
	}

	onHide() {
		this.isHiding = true;
		this.clearHideTimeout();
		this.hideTimeout = setTimeout(() => this.hideDone(), TransitionTime);
		this.removeBackdrop();
	}

	private addBackdrop() {
		if (Screen.isXs && !this.mobileBackdrop) {
			this.mobileBackdrop = Backdrop.push({ className: 'popper-backdrop' });
		}
	}

	private removeBackdrop() {
		if (Screen.isXs && this.mobileBackdrop) {
			Backdrop.remove(this.mobileBackdrop);
			this.mobileBackdrop = null;
		}
	}

	private onContextMenu(e: MouseEvent) {
		if (this.trigger !== 'right-click') {
			return;
		}

		e.preventDefault();
		Popover.hideAll();
		this.onShow();
	}

	@Emit('hide')
	private hideDone() {
		// Making sure that popper doesn't keep tracking positioning
		if (this.popperInstance) {
			this.popperInstance.destroy();
			this.popperInstance = null;
		}
		// or keep watching
		if (this.ResizeObserver) {
			this.ResizeObserver.unobserve(this.$refs.popper);
			this.ResizeObserver = null;
		}

		this.isVisible = false;
		this.isHiding = false;
	}

	private clearHideTimeout() {
		if (this.hideTimeout) {
			clearTimeout(this.hideTimeout);
			this.hideTimeout = undefined;
		}
	}

	@Emit('auto-hide')
	private onAutoHide() {}
}
