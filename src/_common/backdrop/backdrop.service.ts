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

		document.body.style.marginRight = scrollbarWidth + 'px';
		// setting the max-width to the difference in width from scrollbar
		document.getElementById('shell-top-nav').style.maxWidth =
			window.innerWidth - scrollbarWidth + 'px';

		return backdrop;
	}

	static checkBackdrops() {
		const active = this.backdrops.filter(i => i.active);
		if (active.length === 0) {
			document.body.style.marginRight = '';
			document.body.classList.remove('backdrop-active');
		}
	}

	static remove(backdrop: AppBackdrop) {
		// setting max-width to 100vw here will make sure it's set at the proper time
		document.getElementById('shell-top-nav').style.maxWidth = '100vw';
		backdrop.$destroy();
		backdrop.$el.parentNode!.removeChild(backdrop.$el);
		arrayRemove(this.backdrops, i => i === backdrop);
		this.checkBackdrops();
	}
}
