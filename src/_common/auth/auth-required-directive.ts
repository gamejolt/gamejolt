import { DirectiveOptions } from 'vue';
import { Analytics } from '../analytics/analytics.service';
import { appStore } from '../store/app-store';
import { AuthModal } from './auth-modal.service';

export const AppAuthRequired: DirectiveOptions = {
	bind(el) {
		el.addEventListener(
			'click',
			e => {
				if (appStore.state.user) {
					return;
				}

				// Stop everything.
				e.stopPropagation();
				e.stopImmediatePropagation();
				e.preventDefault();

				AuthModal.show();
				Analytics.trackEvent('auth-required-modal', 'shown');
			},
			true
		);
	},
};
