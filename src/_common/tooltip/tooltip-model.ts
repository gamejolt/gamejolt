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
	isActive = true;

	constructor(public el: HTMLElement, binding: DirectiveBinding) {
		el.addEventListener('mouseup', this.onMouseUp);
		el.addEventListener('mouseenter', this.onMouseEnter);
		el.addEventListener('mouseleave', this.onMouseLeave);

		this.update(binding);
	}

	update(binding: DirectiveBinding) {
		const { modifiers, value } = binding;

		// The placement for poppers can be added as a modifier or in the
		// binding.value as { content: string, placement: string}.
		let placement: TooltipPlacement = 'top';
		if (modifiers instanceof Object) {
			const keys = Object.keys(modifiers) as any[];
			placement = keys.find(i => TooltipAllowedPlacements.includes(i));
		} else if (value?.placement) {
			placement = value.placement;
		}

		this.placement = placement;
		this.text = binding.value?.content || binding.value;
	}

	private onMouseUp = () => {
		this.isActive = false;
		assignActiveTooltip(this);
	};

	private onMouseEnter = () => {
		this.isActive = true;
		assignActiveTooltip(this);
	};

	private onMouseLeave = () => {
		this.isActive = false;
		assignActiveTooltip(this);
	};

	destroy() {
		this.el.removeEventListener('mouseup', this.onMouseUp);
		this.el.removeEventListener('mouseenter', this.onMouseEnter);
		this.el.removeEventListener('mouseleave', this.onMouseLeave);
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
