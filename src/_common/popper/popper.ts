import arrow, { ArrowModifier } from '@popperjs/core/lib/modifiers/arrow';
import flip from '@popperjs/core/lib/modifiers/flip';
import preventOverflow, {
	PreventOverflowModifier,
} from '@popperjs/core/lib/modifiers/preventOverflow';
import { createPopper, Instance, Options } from '@popperjs/core/lib/popper-lite';
import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { propOptional } from '../../utils/vue';
import { Backdrop } from '../backdrop/backdrop.service';
import AppBackdrop from '../backdrop/backdrop.vue';
import { AppObserveDimensions } from '../observe-dimensions/observe-dimensions.directive';
import { Screen } from '../screen/screen-service';
import AppScrollScroller from '../scroll/scroller/scroller.vue';
import { Popper } from './popper.service';
import './popper.styl';

// Sync with the styles files.
const TransitionTime = 200;

let PopperIndex = 0;

type ActualTrigger = 'click' | 'hover' | 'manual';

const modifiers = [
	flip,
	preventOverflow,
	arrow,
	// @CHECK, Want to figure out how to hide poppers if trigger is not visible
	{
		// padding between popper and viewport
		name: 'preventOverflow',
		options: {
			padding: 5,
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
	directives: {
		AppObserveDimensions,
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
	@Prop(propOptional(Boolean, false))
	fixed!: boolean;

	/**
	 * By default the popper will stay on the page until the user clicks outside
	 * of the popper. This tells the popper to close anytime the state changes.
	 * Useful for poppers in the shell that link to other pages on the site.
	 */
	@Prop(propOptional(Boolean, false))
	hideOnStateChange!: boolean;

	/**
	 * Whether or not the popper should size itself to the same width as the
	 * trigger. Useful for poppers that work like "select" type controls.
	 */
	@Prop(propOptional(Boolean, false))
	trackTriggerWidth!: boolean;

	/**
	 * Whether or not the popper should take up the full max width instead of
	 * relying on its content to size itself. Useful for poppers that change the
	 * content dynamically and you want it to stay one consistent size.
	 */
	@Prop(propOptional(Boolean, false))
	forceMaxWidth!: boolean;

	// We set a watch on this prop so we know when to display 'manual' triggers.
	@Prop(propOptional(Boolean, false))
	manualShow!: boolean;

	// Sets 'display: block !important' on the trigger element.
	@Prop(propOptional(Boolean, false))
	block!: boolean;

	// Delay for showing a hover-based popper.
	@Prop(propOptional(Number, 0))
	showDelay!: number;

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

	popperInstance!: Instance | null;

	$el!: HTMLDivElement;
	private hideTimeout?: NodeJS.Timer;
	private showDelayTimer?: NodeJS.Timer;
	private mobileBackdrop: AppBackdrop | null = null;

	@Emit('click-away') emitClickAway(_event: MouseEvent) {}
	@Emit('trigger-clicked') emitTriggerClicked(_event: MouseEvent) {}
	@Emit('context-menu') emitContextMenu(_event: MouseEvent) {}
	@Emit('mouse-enter') emitMouseEnter(_event: MouseEvent) {}
	@Emit('mouse-leave') emitMouseLeave(_event: MouseEvent) {}

	get maxHeight() {
		return Screen.height - 100 + 'px';
	}

	get popperId() {
		return 'popper-' + this.popperIndex;
	}

	get triggerClass() {
		let classes = [];

		if (this.block) {
			classes.push('-block');
		}

		if (this.isVisible) {
			classes.push('popped');
		}

		return classes.join(' ');
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
		Popper.registerPopper(this.$router, this);
	}

	destroyed() {
		Popper.deregisterPopper(this);
		this.clearHideTimeout();
		this.removeBackdrop();

		// Destroy any poppers that had their trigger element removed
		if (this.popperInstance) {
			this.popperInstance.destroy();
			this.popperInstance = null;
		}
	}

	onTriggerClicked(event: MouseEvent) {
		this.emitTriggerClicked(event);

		// We want to prevent right-click, hover, and manual triggers from showing poppers on left-click.
		// clickAway() listener will hide poppers when needed, so we only need to show poppers here.
		if (this.trigger !== 'click') {
			return;
		}

		if (this.isVisible) {
			return this.hide();
		}

		this.show();
	}

	onContextMenu(event: MouseEvent) {
		this.emitContextMenu(event);

		if (this.trigger !== 'right-click') {
			return;
		}

		event.preventDefault();

		if (this.isVisible) {
			return this.hide();
		}

		Popper.hideAll();
		this.show();
	}

	private onClickAway(event: MouseEvent) {
		if (this.$refs.popper.contains(event.target) || this.$refs.trigger.contains(event.target)) {
			return;
		}

		this.emitClickAway(event);

		if (this.trigger === 'click' || this.trigger === 'right-click') {
			this.hide();
			document.removeEventListener('click', this.onClickAway, true);
		}
	}

	onMouseEnter(event: MouseEvent) {
		this.emitMouseEnter(event);

		if (this.trigger !== 'hover') {
			return;
		}

		// Cancel the hiding of the popper if re-hovered. We need
		// to do this when moving between a trigger and its popper.
		this.clearHideTimeout();

		// Reverse the hiding if the element is re-hovered.
		if (this.isHiding) {
			this.isHiding = false;
			return;
		}

		if (this.isVisible) {
			return;
		}

		this.showDelayTimer = setTimeout(() => this.show(), this.showDelay);
	}

	onMouseLeave(event: MouseEvent) {
		this.emitMouseLeave(event);

		if (this.trigger !== 'hover') {
			return;
		}

		if (this.showDelayTimer) {
			clearTimeout(this.showDelayTimer);
			this.showDelayTimer = undefined;
		}

		if (!this.isVisible) {
			return;
		}

		this.hide();
	}

	onDimensionsChanged() {
		if (this.popperInstance) {
			console.log('changed');
			this.popperInstance.update();
		}
	}

	async createPopper() {
		this.isVisible = true;
		await this.$nextTick();

		this.popperInstance = createPopper(this.$el, this.$refs.popper, this.popperOptions);

		document.body.appendChild(this.$refs.popper);
		document.addEventListener('click', this.onClickAway, true);
	}

	@Emit('show')
	show() {
		this.clearHideTimeout();
		this.createPopper();

		// If we are tracking a particular element's width, then we set this popover to be the same
		// width as the element. We don't track width when it's an XS screen since we do a full
		// width popover in those cases.
		let widthElem: HTMLElement | undefined;
		if (this.trackTriggerWidth && !Screen.isWindowXs) {
			widthElem = this.$el as HTMLDivElement | undefined;
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

	hide() {
		// In case a popper was hidden from something other than a click,
		// like right-clicking a cbar item or Popover.hideAll() being triggered.
		document.removeEventListener('click', this.onClickAway, true);

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

	@Watch('manualShow')
	onManualShow() {
		if (this.trigger !== 'manual') {
			return;
		}

		if (this.manualShow) {
			return this.show();
		}

		return this.hide();
	}
}
