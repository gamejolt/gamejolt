import { DirectiveOptions } from 'vue';
import { TooltipModel } from './tooltip-model';

const state = new WeakMap<HTMLElement, TooltipModel>();

/**
 * Use the 'touchable' modifier to allow toggle usage for mobile.
 * Never attach a 'touchable' modifier to a link.
 * It will stop the link from working.
 */
export const AppTooltip: DirectiveOptions = {
	bind(el, binding) {
		const tooltip = new TooltipModel(el, binding);
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
