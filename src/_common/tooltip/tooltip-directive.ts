import { DirectiveOptions } from 'vue';
import { TooltipModel } from './tooltip-model';

let state = new WeakMap<HTMLElement, TooltipModel>();

const TooltipDirective: DirectiveOptions = {
	/**
	 * Never attach a 'touchable' modifier to a link.
	 * It will stop the link from working.
	 */
	bind(el, binding) {
		let tooltip = new TooltipModel(el, binding);
		state.set(el, tooltip);
	},
	update(el, binding) {
		state.get(el)?.update(binding);
	},
	unbind(el) {
		state.get(el)?.destroy();
		state.delete(el);
	},
};

export { TooltipDirective as AppTooltip };
