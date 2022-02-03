import { Directive } from '@vue/runtime-core';
import { Analytics } from './analytics.service';

export const vAppTrackEvent: Directive<HTMLElement, string> = {
	beforeMount(el, binding) {
		el.addEventListener('click', () => {
			if (binding.value) {
				const pieces = binding.value.split(':');
				Analytics.trackEvent(pieces[0], pieces[1], pieces[2], pieces[3]);
			}
		});
	},
};
