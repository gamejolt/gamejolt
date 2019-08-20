import { DirectiveFunction } from 'vue';
import { Scroll } from './scroll.service';

export const AppScrollWhen: DirectiveFunction = (el, binding) => {
	if (binding.value && binding.value !== binding.oldValue) {
		Scroll.to(el, { animate: !!binding.modifiers.animate });
	}
};
