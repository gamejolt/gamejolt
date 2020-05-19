import { Placement } from '@popperjs/core/lib';
import flip from '@popperjs/core/lib/modifiers/flip';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { createPopper, Instance, Options } from '@popperjs/core/lib/popper-lite';
import Vue, { DirectiveOptions } from 'vue';
import { DirectiveBinding } from 'vue/types/options';
import './tooltip.styl';

let AppTooltip: DirectiveOptions = {};

let TooltipElement: HTMLElement | null = null;
let PopperElement: Instance | null = null;
let hideTimeout: NodeJS.Timer | null = null;

const getOptions = (modifiers: any) => {
	let placement: Placement = 'top';

	// @REVIEW
	// how do better??? 'binding.modifiers' is an object like { right: true }.
	// We should only be getting one value through it for placement.
	if (modifiers instanceof Object) {
		placement = Object.entries(modifiers)[0][0] as Placement;
	}

	const options: Options = {
		placement: placement,
		modifiers: [flip, preventOverflow],
		strategy: 'absolute',
	};

	return options;
};

const clearHideTimeout = () => {
	if (hideTimeout) {
		clearTimeout(hideTimeout);
		hideTimeout = null;
	}
};

const hideTooltip = () => {
	clearHideTimeout();

	if (PopperElement) {
		PopperElement.destroy();
		PopperElement = null;
	}

	if (TooltipElement) {
		document.body.removeChild(TooltipElement);
		TooltipElement = null;
	}
};

const onMouseEnter = (trigger: HTMLElement, binding: DirectiveBinding) => {
	hideTooltip();
	let tooltipText;

	if (binding.value) {
		tooltipText = binding.value;
	}

	if (!tooltipText) {
		return;
	}

	const _tooltip = document.createElement('div');
	const _inner = document.createElement('div');
	const _content = document.createTextNode(tooltipText);
	_tooltip.className = 'tooltip';
	_inner.className = 'tooltip-inner';

	_tooltip.appendChild(_inner);
	_inner.appendChild(_content);
	TooltipElement = _tooltip;

	PopperElement = createPopper(trigger, TooltipElement, getOptions(binding.modifiers));

	document.body.appendChild(_tooltip);
};

const onMouseUp = (trigger: any, event: MouseEvent) => {
	setTimeout(() => {
		if (trigger.contains(event.target)) {
			return hideTooltip();
		}
	}, 0);
};

const onMouseLeave = () => {
	// use same timeout as the stylus file
	if (TooltipElement) {
		hideTimeout = setTimeout(() => hideTooltip(), 200);
		TooltipElement.classList.add('-hide');
	}
};

const tooltipDirective: DirectiveOptions = {
	bind(el, binding) {
		el.addEventListener('mouseup', event => {
			onMouseUp(el, event);
		});

		el.addEventListener('mouseenter', () => {
			onMouseEnter(el, binding);
		});

		el.addEventListener('mouseleave', () => {
			onMouseLeave();
		});
	},
	unbind(el, binding) {
		el.removeEventListener('mouseup', event => {
			onMouseUp(el, event);
		});

		el.removeEventListener('mouseenter', () => {
			onMouseEnter(el, binding);
		});

		el.removeEventListener('mouseleave', () => {
			onMouseLeave();
		});
	},
};

AppTooltip = Vue.directive('app-tooltip', tooltipDirective);

export { AppTooltip };
