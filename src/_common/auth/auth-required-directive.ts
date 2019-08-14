import { DirectiveOptions } from 'vue';
import { appStore } from '../../vue/services/app/app-store';
import { Analytics } from '../analytics/analytics.service';
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
