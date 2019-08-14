import { DirectiveOptions } from 'vue';
import { Scroll } from '../scroll.service';

export const AppScrollTo: DirectiveOptions = {
	bind(el, binding) {
		el.addEventListener('click', e => {
			e.preventDefault();

			const to = binding.value || (el.getAttribute('href') || '').substring(1);
			if (!to) {
				console.error(new Error(`Couldn't get scroll to.`));
			}

			Scroll.to(to);
		});
	},
};
