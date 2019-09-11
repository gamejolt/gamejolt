import { DirectiveOptions } from 'vue';
import './tooltip.styl';

let AppTooltip: DirectiveOptions = {};
if (!GJ_IS_SSR) {
	const mod: any = require('v-tooltip');
	const VTooltip: any = mod.default;
	AppTooltip = mod.VTooltip;

	// Allows the tooltip to float above any scroll boundaries, otherwise it may not position
	// correctly for things with overflow:hidden.
	(AppTooltip as any).options.defaultBoundariesElement = document.body;

	// Hide on mobile sizes.
	VTooltip.enabled = window.innerWidth > 768;
}

export { AppTooltip };
