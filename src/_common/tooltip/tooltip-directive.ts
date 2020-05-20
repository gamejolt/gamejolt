import { Placement } from '@popperjs/core/lib';
import flip from '@popperjs/core/lib/modifiers/flip';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { createPopper, Instance, Options } from '@popperjs/core/lib/popper-lite';
import { DirectiveOptions } from 'vue';
import { DirectiveBinding } from 'vue/types/options';
import AppTooltipVue from './tooltip.vue';

let TooltipElement: Vue | null = null;
let PopperElement: Instance | null = null;
let hideTimeout: NodeJS.Timer | null = null;
let state = new WeakMap<HTMLElement, Tooltip>();

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
	console.log('faded out');
};

const createTooltip = (trigger: HTMLElement, binding: DirectiveBinding) => {
	TooltipElement = new AppTooltipVue({
		propsData: {
			tooltipText: binding.value,
		},
	});

	if (TooltipElement) {
		const elem = document.createElement('div');
		document.body.appendChild(elem);
		TooltipElement.$mount(elem);

		PopperElement = createPopper(
			trigger,
			TooltipElement.$el as HTMLElement,
			getOptions(binding.modifiers)
		);
		PopperElement.update();
	}

	console.log('props', TooltipElement.$props.tooltipText);
	return TooltipElement;
};

const updateTooltip = (trigger: HTMLElement, binding: DirectiveBinding) => {
	if (!TooltipElement || !PopperElement) {
		return;
	}
	console.log('updating');

	PopperElement.state.elements.reference = trigger;
	PopperElement.state.options = getOptions(binding.modifiers);

	console.log(PopperElement, state.get(trigger));

	PopperElement.update();
};

const onMouseEnter = (trigger: HTMLElement, binding: DirectiveBinding) => {
	clearHideTimeout();

	// create a tooltip if none exist
	if (!TooltipElement) {
		console.log('creating Popper and Tooltip instance');
		return createTooltip(trigger, binding);
	}

	// update tooltip state for current trigger
	updateTooltip(trigger, binding);
};

const onMouseUp = (trigger: any, binding: DirectiveBinding, event: MouseEvent) => {
	if (trigger.contains(event.target)) {
		updateTooltip(trigger, binding);
		hideTooltip();
	}
};

const onMouseLeave = () => {
	// console.log('left');

	// use same timeout as the stylus file
	if (TooltipElement) {
		hideTimeout = setTimeout(() => hideTooltip(), 200);
		// TooltipElement.classList.add('-hide');
	}
};

class Tooltip {
	constructor(private el: HTMLElement, private binding: DirectiveBinding) {
		el.addEventListener('mouseup', this.onMouseUp);
		el.addEventListener('mouseenter', this.onMouseEnter);
		el.addEventListener('mouseleave', this.onMouseLeave);
	}

	private onMouseUp = (event: MouseEvent) => {
		onMouseUp(this.el, this.binding, event);
	};

	private onMouseEnter = () => {
		onMouseEnter(this.el, this.binding);
	};

	private onMouseLeave = () => {
		onMouseLeave();
	};

	destroy() {
		this.el.removeEventListener('mouseup', this.onMouseUp);
		this.el.removeEventListener('mouseenter', this.onMouseEnter);
		this.el.removeEventListener('mouseleave', this.onMouseLeave);
	}
}

export const AppTooltip: DirectiveOptions = {
	bind(el, binding) {
		state.set(el, new Tooltip(el, binding));
		// console.log(el, state);
		// el._tooltip = new Tooltip(el, binding);
	},
	update(el, binding) {
		state.set(el, new Tooltip(el, binding));
	},
	unbind(el) {
		state.delete(el);
		state.get(el)?.destroy();
		// state = undefined;
		// el._tooltip.destroy();
		// el._tooltip = undefined;
	},
};
