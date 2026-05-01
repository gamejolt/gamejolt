import { Directive } from 'vue';

import { showAuthModal } from '~common/auth/auth-modal.service';
import { getCommonStore } from '~common/store/common-store';

export const vAppAuthRequired: Directive<unknown, void> = {
	beforeMount(el: HTMLElement) {
		el.addEventListener(
			'click',
			e => {
				const { user } = getCommonStore();
				if (user.value) {
					return;
				}

				// Stop everything.
				e.stopPropagation();
				e.stopImmediatePropagation();
				e.preventDefault();

				showAuthModal();
			},
			true
		);
	},
};
