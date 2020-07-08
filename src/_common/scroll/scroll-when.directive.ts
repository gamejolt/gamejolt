import { DirectiveFunction } from 'vue';

export const AppScrollWhen: DirectiveFunction = (el, binding) => {
	if (binding.value && binding.value !== binding.oldValue) {
		el.scrollIntoView({
			behavior: !!binding.modifiers.animate ? 'smooth' : 'auto',
		});
	}
};
