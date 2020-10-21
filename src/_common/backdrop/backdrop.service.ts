import { arrayRemove } from '../../utils/array';
import AppBackdropTS from './backdrop';
import AppBackdrop from './backdrop.vue';

export interface BackdropOptions {
	context?: HTMLElement;
	className?: string;
}

export class Backdrop {
	private static backdrops: AppBackdropTS[] = [];

	static push(options: BackdropOptions = {}) {
		const el = document.createElement('div');
		const scrollbarWidth = window.innerWidth - document.body.clientWidth;

		if (!options.context) {
			document.body.appendChild(el);
		} else {
			options.context.appendChild(el);
		}

		const backdrop: AppBackdropTS = new AppBackdrop({
			propsData: {
				className: options.className,
			},
		});

		backdrop.$mount(el);

		this.backdrops.push(backdrop);
		document.body.classList.add('backdrop-active');

		// Take up the space that the scrollbar was taking so that things don't
		// shift to the right when showing a backdrop.
		document.body.style.marginRight = scrollbarWidth + 'px';
		document.querySelectorAll('.backdrop-affected').forEach(i => {
			if (i instanceof HTMLElement) {
				i.style.paddingRight = scrollbarWidth + 'px';
			}
		});

		return backdrop;
	}

	static checkBackdrops() {
		if (this.backdrops.length !== 0) {
			return;
		}

		document.body.classList.remove('backdrop-active');

		// Now we have to remove the spacing that we took up when we pushed
		// the backdrop onto the page.
		document.body.style.marginRight = '';
		document.querySelectorAll('.backdrop-affected').forEach(i => {
			if (i instanceof HTMLElement) {
				i.style.paddingRight = '';
			}
		});
	}

	static remove(backdrop: AppBackdrop) {
		backdrop.$destroy();
		backdrop.$el.parentNode!.removeChild(backdrop.$el);
		arrayRemove(this.backdrops, i => i === backdrop);
		this.checkBackdrops();
	}
}
