import { Directive } from 'vue';

export const vAppTrackEvent: Directive<unknown, string> = {
	beforeMount(_el, _binding) {
		// deprecated: use direct click handlers with "track" functions in analytics.service.ts
		// el.addEventListener('click', () => {
		// 	if (binding.value) {
		// 		const pieces = binding.value.split(':');
		// 		Analytics.trackEvent(pieces[0], pieces[1], pieces[2], pieces[3]);
		// 	}
		// });
	},
};
