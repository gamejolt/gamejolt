import { Directive } from 'vue';
import { Screen } from '../screen/screen-service';

export const vAppFocusWhen: Directive<unknown, boolean | void> = {
	mounted(el: HTMLElement, binding) {
		_tryFocus(el, binding.value, binding.oldValue);
	},
	updated(el: HTMLElement, binding) {
		_tryFocus(el, binding.value, binding.oldValue);
	},
};

function _tryFocus(el: HTMLElement, value: boolean | void, oldValue: boolean | void | null) {
	if (Screen.isMobile) {
		return;
	}

	if (value === undefined || (value && value !== oldValue)) {
		setTimeout(() => {
			el.focus();
		});
	}
}
