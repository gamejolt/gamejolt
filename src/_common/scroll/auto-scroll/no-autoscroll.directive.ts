import { Directive } from 'vue';
import { Scroll } from '../scroll.service';

// I'm not sure of a better way to do this with Vue. When I tried to attach to
// the click handler of the element the router-link click handler gets called
// first. This way we catch the click in the document, and if the target element
// is set to disable scrolling, we do so. It may also be more performant since
// it doesn't have to register many click handlers.

if (!import.meta.env.SSR) {
	// We use capturing so that we get it before it goes through the DOM.
	document.addEventListener(
		'click',
		e => {
			const target = e.target as HTMLElement;
			if (!target) {
				return;
			}

			if (target.dataset.gjAutoscroll) {
				Scroll.shouldAutoScroll = false;
			}
		},
		true
	);
}

export const vAppNoAutoscroll: Directive<HTMLElement> = {
	beforeMount(el) {
		el.dataset.gjAutoscroll = 'disabled';
	},
};
