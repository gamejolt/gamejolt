import { DirectiveBinding, markRaw, reactive, ref } from 'vue';

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

export type TooltipController = ReturnType<typeof makeTooltipController>;

export function makeTooltipController(el: HTMLElement, binding: TooltipDirectiveBinding) {
	const state = reactive({
		el: markRaw(el),
		text: '',
		placement: 'top' as TooltipPlacement,
		isActive: false,
		touchable: false,
		update({ modifiers, value }: TooltipDirectiveBinding) {
			// The placement for poppers can be added as a modifier or in the
			// binding.value as { content: string, placement: string}.
			let newPlacement: TooltipPlacement;
			const keys = Object.keys(modifiers);
			if (typeof value !== 'string' && value?.placement) {
				newPlacement = value.placement;
			} else {
				newPlacement = (keys.find((i: any) => TooltipAllowedPlacements.includes(i)) ??
					'top') as TooltipPlacement;
			}

			state.placement = newPlacement;
			if (!value) {
				state.text = '';
			} else {
				state.text = typeof value === 'string' ? value : value.content;
			}
		},
		destroy() {
			state.el.removeEventListener('pointerenter', _onMouseEnter);
			state.el.removeEventListener('pointerleave', _onMouseLeave);
			state.el.removeEventListener('click', _onClick);
			state.el.removeEventListener('focusout', _onFocusOut);
			if (state.isActive) {
				state.isActive = false;
				_assignActiveTooltip(null);
			}
		},
	});

	if ('touchable' in binding.modifiers) {
		state.touchable = true;
	}

	// Give the element a negative tabindex, or use its own, allowing focus events to work.
	if (state.touchable) {
		el.tabIndex = el.tabIndex ?? -1;
		el.style.outline = 'none';
	}

	el.addEventListener('pointerenter', _onMouseEnter);
	el.addEventListener('pointerleave', _onMouseLeave);
	el.addEventListener('click', _onClick);
	el.addEventListener('focusout', _onFocusOut);
	state.update(binding);

	function _onMouseEnter(event: PointerEvent) {
		// We never want this to trigger on 'touch' or 'pen' inputs.
		if (TouchablePointerTypes.includes(event.pointerType)) {
			return;
		}

		state.isActive = true;
		_assignActiveTooltip(state);
	}

	function _onMouseLeave(event: PointerEvent) {
		// We never want this to trigger on 'touch' or 'pen' inputs.
		if (TouchablePointerTypes.includes(event.pointerType)) {
			return;
		}

		state.isActive = false;
		_assignActiveTooltip(state);
	}

	function _onClick(event: Event) {
		if (state.touchable) {
			state.isActive = !state.isActive;
			// Prevent 'AppShellAccountPopover' from opening wallet balance link.
			event.preventDefault();
			// Prevent 'AppPostControlsStats' from opening post view.
			event.stopPropagation();
		} else {
			state.isActive = false;
		}

		_assignActiveTooltip(state);
	}

	function _onFocusOut() {
		state.isActive = false;
	}

	return state;
}

const _activeTooltip = ref<null | TooltipController>(null);

function _assignActiveTooltip(tooltip: TooltipController | null) {
	_activeTooltip.value = tooltip;
}

export function getActiveTooltip() {
	return _activeTooltip.value;
}
