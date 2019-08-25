import { DirectiveOptions } from 'vue';
import { Screen } from '../screen/screen-service';

export const AppFocusWhen: DirectiveOptions = {
	bind: (el: HTMLElement, binding) => {
		if (Screen.isMobile) {
			return;
		}

		if (
			(binding.value && binding.value !== binding.oldValue) ||
			(typeof binding.value === 'undefined' && el.dataset.appFocusWhen !== 'focused')
		) {
			setTimeout(() => {
				el.focus();
				el.dataset.appFocusWhen = 'focused';
			});
		}
	},
};
