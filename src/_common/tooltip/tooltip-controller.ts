import { App, computed, createApp, DirectiveBinding, ref } from 'vue';
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

export type TooltipDirectiveValue =
	| string
	| undefined
	| null
	| { content: string; placement?: TooltipPlacement };

type TooltipDirectiveBinding = DirectiveBinding<TooltipDirectiveValue>;

export class TooltipController {
	text = '';
	placement: TooltipPlacement = 'top';
	isActive = false;
	touchable = false;

	constructor(public el: HTMLElement, binding: TooltipDirectiveBinding) {
		if ('touchable' in binding.modifiers) {
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

	update({ modifiers, value }: TooltipDirectiveBinding) {
		// The placement for poppers can be added as a modifier or in the
		// binding.value as { content: string, placement: string}.
		let placement: TooltipPlacement;
		const keys = Object.keys(modifiers);
		if (typeof value !== 'string' && value?.placement) {
			placement = value.placement;
		} else {
			placement = (keys.find((i: any) => TooltipAllowedPlacements.includes(i)) ??
				'top') as TooltipPlacement;
		}

		this.placement = placement;
		if (!value) {
			this.text = '';
		} else {
			this.text = typeof value === 'string' ? value : value.content;
		}
	}

	private onMouseEnter = (event: PointerEvent) => {
		// We never want this to trigger on 'touch' or 'pen' inputs.
		if (TouchablePointerTypes.includes(event.pointerType)) {
			return;
		}

		this.isActive = true;
		_assignActiveTooltip(this);
	};

	private onMouseLeave = (event: PointerEvent) => {
		// We never want this to trigger on 'touch' or 'pen' inputs.
		if (TouchablePointerTypes.includes(event.pointerType)) {
			return;
		}

		this.isActive = false;
		_assignActiveTooltip(this);
	};

	private onClick = (event: Event) => {
		if (this.touchable) {
			this.isActive = !this.isActive;
			// Prevent 'AppShellAccountPopover' from opening wallet balance link.
			event.preventDefault();
			// Prevent 'AppPostControlsStats' from opening post view.
			event.stopPropagation();
		} else {
			this.isActive = false;
		}

		_assignActiveTooltip(this);
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

let _tooltipApp: null | App = null;
const _tooltipController = ref<null | TooltipController>(null);

function _getTooltipSingleton() {
	if (!_tooltipApp) {
		// TODO(vue3): i have no clue if this will work...
		_tooltipApp = createApp(AppTooltip, {
			controller: computed(() => _tooltipController.value),
		});

		// Mount it into the DOM.
		_tooltipApp.mount(document.body);
	}

	return _tooltipController;
}

function _assignActiveTooltip(tooltip: TooltipController) {
	_getTooltipSingleton().value = tooltip;
}
