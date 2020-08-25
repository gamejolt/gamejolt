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

const TouchablePointerTypes = ['touch', 'pen'];

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

		el.addEventListener('pointerenter', this.onMouseEnter);
		el.addEventListener('pointerleave', this.onMouseLeave);
		el.addEventListener('click', this.onClick);
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

	private onMouseEnter = (event: PointerEvent) => {
		// We never want this to trigger on 'touch' or 'pen' inputs.
		if (TouchablePointerTypes.includes(event.pointerType)) {
			return;
		}

		this.isActive = true;
		assignActiveTooltip(this);
	};

	private onMouseLeave = (event: PointerEvent) => {
		// We never want this to trigger on 'touch' or 'pen' inputs.
		if (TouchablePointerTypes.includes(event.pointerType)) {
			return;
		}

		this.isActive = false;
		assignActiveTooltip(this);
	};

	private onClick = (event: Event) => {
		if (this.touchable) {
			this.isActive = !this.isActive;
			// Prevent 'AppShellAccountPopover' from opening wallet balance link.
			event.preventDefault();
			// Prevent 'AppEventItemControlsFiresidePostStats' from opening post view.
			event.stopPropagation();
		} else {
			this.isActive = false;
		}

		assignActiveTooltip(this);
	};

	private onFocusOut = () => {
		this.isActive = false;
	};

	destroy() {
		this.el.removeEventListener('pointerenter', this.onMouseEnter);
		this.el.removeEventListener('pointerleave', this.onMouseLeave);
		this.el.removeEventListener('click', this.onClick);
		this.el.removeEventListener('focusout', this.onFocusOut);
		this.isActive = false;
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
