import { DirectiveBinding } from 'vue/types/options';
import AppTooltipTS from './tooltip';
import AppTooltip from './tooltip.vue';

// Same thing as Placement (from @popperjs) or TooltipPlacement
export const TooltipAllowedPlacements: TooltipPlacement[] = [
	'auto',
	'auto-start',
	'auto-end',
	'top',
	'top-start',
	'top-end',
	'right',
	'right-start',
	'right-end',
	'bottom',
	'bottom-start',
	'bottom-end',
	'left',
	'left-start',
	'left-end',
];

export type TooltipPlacement =
	| 'auto'
	| 'auto-start'
	| 'auto-end'
	| 'top'
	| 'top-start'
	| 'top-end'
	| 'right'
	| 'right-start'
	| 'right-end'
	| 'bottom'
	| 'bottom-start'
	| 'bottom-end'
	| 'left'
	| 'left-start'
	| 'left-end';

export class TooltipModel {
	text = '';
	placement: TooltipPlacement = 'top';
	isActive = false;
	touchable = false;

	constructor(public el: HTMLElement, binding: DirectiveBinding) {
		const { modifiers } = binding;
		if (modifiers instanceof Object) {
			const keys = Object.keys(binding.modifiers) as any[];
			this.touchable = keys.includes('touchable');
		}

		if (this.touchable) {
			el.tabIndex = el.tabIndex ?? -1;
			el.style.outline = 'none';
		}

		el.addEventListener('pointerup', this.onPointerUp);
		el.addEventListener('pointerenter', this.onPointerEnter);
		el.addEventListener('pointerleave', this.onPointerLeave);
		el.addEventListener('focusout', this.onFocusOut);
		// TODO: Add some kind of clickAway listener/handler to hide tooltip on mobile scroll.
		this.update(binding);
	}

	update(binding: DirectiveBinding) {
		const { modifiers, value } = binding;

		// The placement for poppers can be added as a modifier or in the
		// binding.value as { content: string, placement: string}.
		let placement: TooltipPlacement = 'top';
		if (modifiers instanceof Object) {
			const keys = Object.keys(modifiers) as any[];
			placement = keys.find(i => TooltipAllowedPlacements.includes(i)) ?? 'top';
		}

		if (value?.placement) {
			placement = value.placement;
		}

		this.placement = placement;
		this.text = binding.value?.content || binding.value;
	}

	private onPointerUp = (event: PointerEvent) => {
		// Touch should use tooltip triggers as toggles,
		// but mouse events should only hide tooltips.
		if (event.pointerType === 'touch' && this.touchable) {
			this.isActive = !this.isActive;
		} else {
			this.isActive = false;
		}

		assignActiveTooltip(this);
	};

	private onPointerEnter = (event: PointerEvent) => {
		// We don't want to check for mouseenter on touch.
		if (event.pointerType === 'touch') {
			return;
		}

		this.isActive = true;
		assignActiveTooltip(this);
	};

	private onPointerLeave = (event: PointerEvent) => {
		// This stops the event from 'pointerleave'
		// triggering on tap for touch.
		if (event.pointerType === 'touch') {
			return;
		}

		this.isActive = false;
		assignActiveTooltip(this);
	};

	private onFocusOut = () => {
		this.isActive = false;
	};

	destroy() {
		this.el.removeEventListener('pointerup', this.onPointerUp);
		this.el.removeEventListener('pointerenter', this.onPointerEnter);
		this.el.removeEventListener('pointerleave', this.onPointerLeave);
		this.el.removeEventListener('focusout', this.onFocusOut);
	}
}

let TooltipSingleton: null | AppTooltipTS = null;

function getTooltipSingleton() {
	if (!TooltipSingleton) {
		TooltipSingleton = new AppTooltip() as AppTooltipTS;

		// Mount it into the DOM.
		const elem = document.createElement('div');
		document.body.appendChild(elem);
		TooltipSingleton.$mount(elem);
	}

	return TooltipSingleton;
}

function assignActiveTooltip(tooltip: TooltipModel) {
	getTooltipSingleton().tooltip = tooltip;
}
