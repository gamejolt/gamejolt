import { Directive } from 'vue';
import { appStore } from '../store/app-store';
import { AuthModal } from './auth-modal.service';

export const AppAuthRequired: Directive<HTMLElement, void> = {
	beforeMount(el) {
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
			},
			true
		);
	},
};
