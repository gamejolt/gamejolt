import { Directive } from 'vue';
import { TooltipController, TooltipDirectiveValue } from './tooltip-controller';

const state = new WeakMap<HTMLElement, TooltipController>();

/**
 * Use the 'touchable' modifier to allow toggle usage for mobile.
 * Never attach a 'touchable' modifier to a link.
 * It will stop the link from working.
 */
export const AppTooltip: Directive<HTMLElement, TooltipDirectiveValue> = {
	beforeMount(el, binding) {
		const tooltip = new TooltipController(el, binding);
		state.set(el, tooltip);
	},
	updated(el, binding) {
		state.get(el)?.update(binding);
	},
	unmounted(el) {
		state.get(el)?.destroy();
		state.delete(el);
	},
};
