import { Component, Directive } from 'vue';
import {
	TooltipController,
	TooltipDirectiveValue,
	makeTooltipController,
} from './tooltip-controller';

const state = new WeakMap<HTMLElement | Component, TooltipController>();

/**
 * Use the 'touchable' modifier to allow toggle usage for mobile.
 * Never attach a 'touchable' modifier to a link.
 * It will stop the link from working.
 */
export const vAppTooltip: Directive<HTMLElement, TooltipDirectiveValue> = {
	beforeMount(el, binding) {
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
