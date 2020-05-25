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
		if (modifiers instanceof Object && 'touchable' in binding.modifiers) {
			this.touchable = true;
		}

		// Give the element a negative tabindex, or use its own, allowing focus events to work.
		if (this.touchable) {
			el.tabIndex = el.tabIndex ?? -1;
			el.style.outline = 'none';
		}

		el.addEventListener('pointerup', this.onPointerUp);
		el.addEventListener('pointerenter', this.onMouseEnter);
		el.addEventListener('pointerleave', this.onMouseLeave);
		el.addEventListener('click', this.onTriggerClicked);
		el.addEventListener('focusout', this.onFocusOut);
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
		// Touch uses tooltip triggers as toggles,
		// but mouse events should only hide tooltips.
		if (
			(event.pointerType === 'touch' && this.touchable) ||
			(event.pointerType === 'pen' && this.touchable)
		) {
			// If the direct parent of the directive is a router-link or <a>,
			// we need to manually set the focus for 'focusout' to work properly.
			this.el.focus();
			this.isActive = !this.isActive;
			assignActiveTooltip(this);
		} else {
			this.isActive = false;
			assignActiveTooltip(this);
		}
	};

	private onMouseEnter = (event: PointerEvent) => {
		// We don't want to check for mouseenter on touch.
		if (event.pointerType === 'touch' || event.pointerType === 'pen') {
			return;
		}

		this.isActive = true;
		assignActiveTooltip(this);
	};

	private onMouseLeave = (event: PointerEvent) => {
		// This normally triggers when a 'touchend' would,
		// but we want to hide tooltips on 'focusout' for touch events.
		if (event.pointerType === 'touch' || event.pointerType === 'pen') {
			return;
		}

		this.isActive = false;
		assignActiveTooltip(this);
	};

	private onFocusOut = () => {
		this.isActive = false;
	};

	private onTriggerClicked = (event: TouchEvent) => {
		if (this.touchable) {
			event.preventDefault();
		}
	};

	destroy() {
		this.el.removeEventListener('pointerup', this.onPointerUp);
		this.el.removeEventListener('pointerenter', this.onMouseEnter);
		this.el.removeEventListener('pointerleave', this.onMouseLeave);
		this.el.removeEventListener('click', this.onTriggerClicked);
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
