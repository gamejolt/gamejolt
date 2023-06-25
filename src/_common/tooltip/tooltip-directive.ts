import { Directive } from 'vue';
import {
	makeTooltipController,
	TooltipController,
	TooltipDirectiveValue,
} from './tooltip-controller';

const state = new WeakMap<any, TooltipController>();

/**
 * Use the 'touchable' modifier to allow toggle usage for mobile.
 * Never attach a 'touchable' modifier to a link.
 * It will stop the link from working.
 */
export const vAppTooltip: Directive<unknown, TooltipDirectiveValue> = {
	beforeMount(el: HTMLElement, binding) {
		const tooltip = makeTooltipController(el, binding);
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
