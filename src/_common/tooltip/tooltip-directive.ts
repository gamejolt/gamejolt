import { DirectiveOptions } from 'vue';
import { TooltipModel } from './tooltip-model';

/**
 * If using 'touchable' modifier on 'AppJolticon', you much attach
 * the following to 'AppJolticon' itself - not an element wrapping it:
 *
 * @touchend.native.prevent		// if there is a router-link or <a> parent to stop the route change
 * v-app-tooltip.touchable=""	// allow touch events to trigger tooltips
 *
 * If we put these on a wrapping element instead of AppJolticon itself,
 * the 'focus' and 'pointerup' events won't properly trigger and we
 * can end up clicking the link behind the jolticon.
 */

let state = new WeakMap<HTMLElement, TooltipModel>();

const TooltipDirective: DirectiveOptions = {
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
