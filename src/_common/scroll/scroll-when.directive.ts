import { Directive } from 'vue';

export const vAppScrollWhen: Directive = (el, binding) => {
	if (binding.value && binding.value !== binding.oldValue) {
		el.scrollIntoView({
			behavior: binding.modifiers.animate ? 'smooth' : 'auto',
			block: binding.modifiers.nearest ? 'nearest' : 'start',
		});
	}
};
