import { Directive } from 'vue';

export const AppScrollWhen: Directive = (el, binding) => {
	if (binding.value && binding.value !== binding.oldValue) {
		el.scrollIntoView({
			behavior: binding.modifiers.animate ? 'smooth' : 'auto',
		});
	}
};
