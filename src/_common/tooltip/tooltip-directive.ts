import { DirectiveOptions } from 'vue';
import { TooltipModel } from './tooltip-model';

// let PopperInstance: Instance | null = null;
// let popperTimout: NodeJS.Timer | null = null;

// const hideTooltip = () => {
// 	if (!TooltipElement) {
// 		return;
// 	}

// 	if (!TooltipElement.$el.classList.contains('-hide')) {
// 		TooltipElement.$el.classList.add('-hide');
// 	}

// 	popperTimout = setTimeout(() => destroyPopper(), 1000);
// };

// const showTooltip = () => {
// 	if (!TooltipElement) {
// 		return;
// 	}

// 	if (TooltipElement.$el.classList.contains('-hide')) {
// 		TooltipElement.$el.classList.remove('-hide');
// 	}
// };

// const createTooltip = (trigger: HTMLElement, binding: DirectiveBinding) => {
// 	if (!TooltipElement) {
// 		TooltipElement = new AppTooltip({
// 			// props: {
// 			// 	// I don't know why the prop in tooltip.ts isn't working
// 			// 	tooltipText: {
// 			// 		type: String,
// 			// 	},
// 			// },
// 			// propsData: {
// 			// 	// tooltipText: binding.value.content || binding.value,
// 			// 	tooltipText: '',
// 			// },
// 		});

// 		const elem = document.createElement('div');
// 		document.body.appendChild(elem);
// 		TooltipElement.$mount(elem);
// 	}

// 	// We only want to make a popper instance if we have something to show.
// 	if (!PopperInstance && binding.value) {
// 		PopperInstance = createPopper(
// 			trigger,
// 			TooltipElement.$el as HTMLElement,
// 			getOptions(binding)
// 		);

// 		showTooltip();
// 	}
// };

// const updateTooltip = (trigger: HTMLElement, binding: DirectiveBinding) => {
// 	if (!TooltipElement || !PopperInstance) {
// 		return;
// 	}

// 	PopperInstance.state.elements.reference = trigger;
// 	PopperInstance.state.options = getOptions(binding);

// 	// binding.value can return a string or an object as { conteont: string, placement: string }.
// 	TooltipElement.$props.tooltipText = binding.value.content || binding.value;

// 	console.log('updating', PopperInstance, state.get(trigger));

// 	// Update the position of the popper to track the proper trigger
// 	PopperInstance.update();
// };

let state = new WeakMap<HTMLElement, TooltipModel>();

const TooltipDirective: DirectiveOptions = {
	bind(el, binding) {
		let tooltip = new TooltipModel(el, binding);
		// tooltip = Vue.observable(tooltip);
		state.set(el, tooltip);
	},
	// update(el, binding) {
	// 	state.get(el)?.update(binding);
	// },
	unbind(el) {
		state.get(el)?.destroy();
		state.delete(el);
	},
};

export { TooltipDirective as AppTooltip };
