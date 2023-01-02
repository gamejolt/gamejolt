import { Directive } from 'vue';
import { commonStore } from '../store/common-store';
import { AuthModal } from './auth-modal.service';

export const vAppAuthRequired: Directive<HTMLElement, void> = {
	beforeMount(el) {
		el.addEventListener(
			'click',
			e => {
				if (commonStore.user.value) {
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
