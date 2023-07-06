import { Directive } from 'vue';
import { Scroll } from '../scroll.service';

export const vAppScrollTo: Directive<unknown, string | undefined> = {
	beforeMount(el: HTMLElement, binding) {
		el.addEventListener('click', e => {
			e.preventDefault();

			const to = binding.value ?? (el.getAttribute('href') ?? '').substring(1);
			if (!to) {
				console.error(new Error(`Couldn't get scroll to.`));
			}

			Scroll.to(to);
		});
	},
};
