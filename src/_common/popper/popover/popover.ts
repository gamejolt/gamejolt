import { createPopper, Instance, Options } from '@popperjs/core';
import { ArrowModifier } from '@popperjs/core/lib/modifiers/arrow';
import { PreventOverflowModifier } from '@popperjs/core/lib/modifiers/preventOverflow';
import ResizeObserver from 'resize-observer-polyfill';
import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
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

const modifiers = [
	{
		// padding between popper and viewport
		name: 'preventOverflow',
		options: {
			padding: 8,
		},
	} as PreventOverflowModifier,
	{
		// padding between popper-arrow and corner, to prevent overflow with border-radius
		name: 'arrow',
		options: {
			padding: 8,
		},
	} as ArrowModifier,
];

@Component({
	components: {
		AppScrollScroller,
	},
})
export default class AppPopper extends Vue {
	@Prop(propOptional(String, 'bottom'))
	placement!: 'top' | 'right' | 'bottom' | 'left';

	@Prop(propOptional(String, 'click'))
	trigger!: ActualTrigger | 'right-click';

	/**
	 * We want the popper to be 'display: fixed' if we use it on a fixed parent.
	 * This should prevent stuttering on scroll if the popper is attached to the nav.
	 */
	@Prop(propOptional(Boolean))
	fixed?: boolean;

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

	// used to disable adding games to playlists when not logged in
	// @Prop(propOptional(Boolean))
	// disabled?: boolean;

	@Prop(Boolean)
	show?: boolean;

	// sets 'display: block !important'
	@Prop(propOptional(Boolean))
	block?: boolean;

	@Prop(propOptional(String, null))
	popoverClass!: null | string;

	$refs!: {
		trigger: any;
		popper: any;
	};

	isHiding = false;
	isVisible = false;
	width = '';
	maxWidth = '';
	popperIndex = PopperIndex++;

	private _triggerElement!: HTMLElement;
	ResizeObserver!: ResizeObserver | null;
	popperInstance!: Instance | null;

	private hideTimeout?: NodeJS.Timer;
	private mobileBackdrop: AppBackdrop | null = null;

	get maxHeight() {
		return Screen.height - 100 + 'px';
	}

	get popperId() {
		return 'popper-' + this.popperIndex;
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
			modifiers: [...modifiers],
			strategy: this.fixed ? 'fixed' : 'absolute',
		};
	}

	mounted() {
		Popover.registerPopper(this.$router, this);
		this._triggerElement = this.$el as HTMLDivElement;
		if (this.trigger === 'hover') {
			this._triggerElement.addEventListener('mouseenter', this.onMouseEnter);
			this._triggerElement.addEventListener('mouseleave', this.onMouseLeave);
		}
	}

	destroyed() {
		Popover.deregisterPopper(this);
		this.clearHideTimeout();
		this.removeBackdrop();
	}

	triggerClicked() {
		// We want to prevent right-click, hover, and manual triggers from showing poppers on left-click.
		// clickAway() listener will hide poppers when needed, so we only need to show poppers here.
		if (this.trigger !== 'click' || this.isVisible) {
			return;
		}

		this.onShow();
	}

	onContextMenu(event: MouseEvent) {
		if (this.trigger !== 'right-click') {
			return;
		}

		if (this.isVisible) {
			return event.preventDefault();
		}

		event.preventDefault();
		Popover.hideAll();
		this.onShow();
	}

	private clickAway(event: MouseEvent) {
		if (
			this.$refs.popper.contains(event.target) ||
			(this.$refs.trigger.contains(event.target) && this.trigger === 'manual')
		) {
			return;
		}

		this.onHide();
		document.removeEventListener('click', this.clickAway, true);
	}

	onMouseEnter() {
		this.clearHideTimeout();

		if (this.isVisible) {
			return;
		}

		this.hideTimeout = setTimeout(() => this.onShow(), 500); // @CHECK, this needs to be taken from our delay prop
	}

	onMouseLeave() {
		this.clearHideTimeout();
		if (!this.isVisible) {
			return;
		}

		// @CHECK, need to figure out these eventlistener race conditions,
		// or a better system for when moving between trigger/popper.
		this.hideTimeout = setTimeout(() => {
			this.onHide();
		}, 50);
	}

	async createPopper() {
		this.isVisible = true;
		await this.$nextTick();

		this.popperInstance = createPopper(
			this._triggerElement,
			this.$refs.popper,
			this.popperOptions
		);

		this.ResizeObserver = new ResizeObserver(() => {
			if (this.popperInstance) {
				this.popperInstance.update();
			}
		});
		this.ResizeObserver.observe(this.$refs.popper);

		document.body.appendChild(this.$refs.popper);

		if (this.trigger !== 'hover') {
			document.addEventListener('click', this.clickAway, true);
		} else {
			this.$refs.popper.addEventListener('mouseenter', this.onMouseEnter);
			this.$refs.popper.addEventListener('mouseleave', this.onMouseLeave);
		}
		// console.log(this.$refs.trigger instanceof (AppButton));
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
			widthElem = this._triggerElement as HTMLElement | undefined;
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
		// In case a popper was hidden from something other than a click,
		// like right-clicking a cbar item or Popover.hideAll() being triggered.
		if (this.trigger !== 'hover') {
			document.removeEventListener('click', this.clickAway, true);
		}

		this.isHiding = true;
		this.clearHideTimeout();
		this.hideTimeout = setTimeout(() => this.hideDone(), TransitionTime);
		this.removeBackdrop();
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

	private clearHideTimeout() {
		if (this.hideTimeout) {
			clearTimeout(this.hideTimeout);
			this.hideTimeout = undefined;
		}
	}

	@Watch('show')
	onManualShow() {
		if (this.trigger !== 'manual') {
			return;
		}

		if (this.show) {
			return this.onShow();
		}

		return this.onHide();
	}
}
