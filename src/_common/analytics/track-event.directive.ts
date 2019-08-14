import { DirectiveOptions } from 'vue';
import { Analytics } from './analytics.service';

export const AppTrackEvent: DirectiveOptions = {
	bind(el, binding) {
		el.addEventListener('click', () => {
			if (binding.value) {
				const pieces = binding.value.split(':');
				Analytics.trackEvent(pieces[0], pieces[1], pieces[2], pieces[3]);
			}
		});
	},
};
