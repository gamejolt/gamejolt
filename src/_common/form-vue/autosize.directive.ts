import * as autosize from 'autosize';
import { Directive } from 'vue';

export interface AutosizeBootstrap {
	/**
	 * You can call this to update the autosizer to recheck height.
	 */
	updater: () => void;
}

type AutosizeValue = (options: AutosizeBootstrap) => void;

export const vAppFormAutosize: Directive<unknown, AutosizeValue | void> = {
	mounted(el: HTMLElement, binding) {
		autosize(el);

		// If a value was sent in, we call it as a function with our hooks so
		// that the parent component can call into us.
		if (binding.value) {
			const bootstrap = binding.value;
			bootstrap({
				updater() {
					autosize.update(el);
				},
			});
		}
	},
	unmounted(el: HTMLElement) {
		autosize.destroy(el);
	},
};
