import { Directive } from 'vue';

import { getScreen } from '~common/screen/screen-service';

export const vAppFocusWhen: Directive<unknown, boolean | void> = {
	mounted(el: HTMLElement, binding) {
		_tryFocus(el, binding.value, binding.oldValue);
	},
	updated(el: HTMLElement, binding) {
		_tryFocus(el, binding.value, binding.oldValue);
	},
};

function _tryFocus(el: HTMLElement, value: boolean | void, oldValue: boolean | void | null) {
	if (getScreen().isMobile.value) {
		return;
	}

	if (value === undefined || (value && value !== oldValue)) {
		setTimeout(() => {
			el.focus();
		});
	}
}
