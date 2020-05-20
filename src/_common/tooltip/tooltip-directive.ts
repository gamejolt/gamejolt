import { Placement } from '@popperjs/core/lib';
import flip from '@popperjs/core/lib/modifiers/flip';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { createPopper, Instance, Options } from '@popperjs/core/lib/popper-lite';
import { DirectiveOptions } from 'vue';
import { DirectiveBinding } from 'vue/types/options';
import AppTooltipVue from './tooltip.vue';

let TooltipElement: Vue | null = null;
let PopperElement: Instance | null = null;
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

const hideTooltip = () => {
	if (!TooltipElement) {
		return;
	}

	if (!TooltipElement.$el.classList.contains('-hide')) {
		TooltipElement.$el.classList.add('-hide');
	}
};

const createTooltip = (trigger: HTMLElement, binding: DirectiveBinding) => {
	TooltipElement = new AppTooltipVue({
		props: {
			// I don't know why the prop in tooltip.ts isn't working
			tooltipText: {
				type: String,
			},
		},
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
	}

	return TooltipElement;
};

const updateTooltip = (trigger: HTMLElement, binding: DirectiveBinding) => {
	if (!TooltipElement || !PopperElement) {
		return;
	}

	PopperElement.state.elements.reference = trigger;
	PopperElement.state.options = getOptions(binding.modifiers);

	// updates to the old value, displaying "Liked" when you unlike a post - but state.get(trigger).binding.value has the correct value
	TooltipElement.$props.tooltipText = binding.value;

	console.log('updating', PopperElement, state.get(trigger));

	// Update the position of the popper to track the proper trigger
	PopperElement.update();
};

const onMouseEnter = (trigger: HTMLElement, binding: DirectiveBinding) => {
	if (!TooltipElement) {
		console.log('creating Popper and Tooltip instance');
		return createTooltip(trigger, binding);
	}

	// update tooltip state for current trigger
	updateTooltip(trigger, binding);
	TooltipElement.$el.classList.remove('-hide');
};

const onMouseUp = async (trigger: HTMLElement, binding: DirectiveBinding) => {
	hideTooltip();
	// await sleep(0);
	updateTooltip(trigger, binding);
};

const onMouseLeave = () => {
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
		// console.log(el, state);
		// el._tooltip = new Tooltip(el, binding);
	},
	componentUpdated(el, binding) {
		state.get(el)?.destroy();
		state.delete(el);
		state.set(el, new Tooltip(el, binding));
	},
	unbind(el) {
		state.get(el)?.destroy();
		state.delete(el);
		// state = undefined;
		// el._tooltip.destroy();
		// el._tooltip = undefined;
	},
};

export { TooltipDirective as AppTooltip };
