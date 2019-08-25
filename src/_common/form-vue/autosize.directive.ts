import * as autosize from 'autosize';
import { DirectiveOptions } from 'vue';

export interface AutosizeBootstrap {
	/**
	 * You can call this to update the autosizer to recheck height.
	 */
	updater: () => void;
}

type AutosizeValue = (options: AutosizeBootstrap) => void;

export const AppFormAutosize: DirectiveOptions = {
	inserted(el, binding) {
		autosize(el);

		// If a value was sent in, we call it as a function with our hooks so
		// that the parent component can call into us.
		if (binding.value) {
			const bootstrap = binding.value as AutosizeValue;
			bootstrap({
				updater() {
					autosize.update(el);
				},
			});
		}
	},
	unbind(el) {
		autosize.destroy(el);
	},
};
