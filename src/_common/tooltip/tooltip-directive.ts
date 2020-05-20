import flip from '@popperjs/core/lib/modifiers/flip';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { createPopper, Instance, Options } from '@popperjs/core/lib/popper-lite';
import { DirectiveOptions } from 'vue';
import { DirectiveBinding } from 'vue/types/options';
import AppTooltip from './tooltip.vue';

let TooltipElement: Vue | null = null;
let PopperInstance: Instance | null = null;
let popperTimout: NodeJS.Timer | null = null;

let state = new WeakMap<HTMLElement, Tooltip>();

// Same thing as Placement (from @popperjs) or TooltipPlacement
let allowedPlacements: Array<string> = [
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

const getOptions = (binding: DirectiveBinding) => {
	// TS freaks out if we try to define this as either Placement (from @popperjs) or TooltipPlacement types.
	let placement: any = 'top';

	// The placement for poppers can be added as a modifier or in the binding.value as { content: string, placement: string}.
	if (binding.modifiers instanceof Object) {
		placement = Object.keys(binding.modifiers).find(i => allowedPlacements.includes(i));
	} else if (binding.value.placement) {
		placement = binding.value.placement;
	}

	const options: Options = {
		placement,
		modifiers: [flip, preventOverflow],
		strategy: 'absolute',
	};

	return options;
};

const clearPopperTimeout = () => {
	if (popperTimout) {
		clearTimeout(popperTimout);
		popperTimout = null;
	}
};

const destroyPopper = () => {
	if (PopperInstance) {
		PopperInstance.destroy();
		PopperInstance = null;
	}
};

const hideTooltip = () => {
	if (!TooltipElement) {
		return;
	}

	if (!TooltipElement.$el.classList.contains('-hide')) {
		TooltipElement.$el.classList.add('-hide');
	}

	popperTimout = setTimeout(() => destroyPopper(), 1000);
};

const showTooltip = () => {
	if (!TooltipElement) {
		return;
	}

	if (TooltipElement.$el.classList.contains('-hide')) {
		TooltipElement.$el.classList.remove('-hide');
	}
};

const createTooltip = (trigger: HTMLElement, binding: DirectiveBinding) => {
	if (!TooltipElement) {
		TooltipElement = new AppTooltip({
			props: {
				// I don't know why the prop in tooltip.ts isn't working
				tooltipText: {
					type: String,
				},
			},
			propsData: {
				tooltipText: binding.value.content || binding.value,
			},
		});

		const elem = document.createElement('div');
		document.body.appendChild(elem);
		TooltipElement.$mount(elem);
	}

	// We only want to make a popper instance if we have something to show.
	if (!PopperInstance && binding.value) {
		PopperInstance = createPopper(
			trigger,
			TooltipElement.$el as HTMLElement,
			getOptions(binding)
		);

		showTooltip();
	}
};

const updateTooltip = (trigger: HTMLElement, binding: DirectiveBinding) => {
	if (!TooltipElement || !PopperInstance) {
		return;
	}

	PopperInstance.state.elements.reference = trigger;
	PopperInstance.state.options = getOptions(binding);

	// binding.value can return a string or an object as { conteont: string, placement: string }.
	TooltipElement.$props.tooltipText = binding.value.content || binding.value;

	console.log('updating', PopperInstance, state.get(trigger));

	// Update the position of the popper to track the proper trigger
	PopperInstance.update();
};

const onMouseEnter = (trigger: HTMLElement, binding: DirectiveBinding) => {
	if (!TooltipElement || !PopperInstance) {
		console.log('creating Popper and Tooltip instance');
		return createTooltip(trigger, binding);
	}

	if (!binding.value) {
		return destroyPopper();
	}

	// update tooltip state for current trigger
	updateTooltip(trigger, binding);
	clearPopperTimeout();
	showTooltip();
};

const onMouseUp = async (trigger: HTMLElement, binding: DirectiveBinding) => {
	if (!PopperInstance) {
		return;
	}

	hideTooltip();
	updateTooltip(trigger, binding);
};

const onMouseLeave = () => {
	if (!PopperInstance) {
		return;
	}

	hideTooltip();
};

class Tooltip {
	constructor(private el: HTMLElement, private binding: DirectiveBinding) {
		el.addEventListener('mouseup', this.onMouseUp);
		el.addEventListener('mouseenter', this.onMouseEnter);
		el.addEventListener('mouseleave', this.onMouseLeave);
	}

	private onMouseUp = () => {
		onMouseUp(this.el, this.binding);
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

const TooltipDirective: DirectiveOptions = {
	bind(el, binding) {
		state.set(el, new Tooltip(el, binding));
	},
	componentUpdated(el, binding) {
		state.get(el)?.destroy();
		state.delete(el);
		state.set(el, new Tooltip(el, binding));
	},
	unbind(el) {
		state.get(el)?.destroy();
		state.delete(el);
	},
};

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

export { TooltipDirective as AppTooltip };
