import { reactive, ref } from 'vue';
import { arrayRemove } from '../../utils/array';

interface BackdropOptions {
	context?: HTMLElement | string;
	className?: string;
}

function createBackdrop(
	options: BackdropOptions & {
		remove: () => void;
	}
) {
	return reactive({
		className: options.className,
		context: options.context,
		remove: options.remove,
		onClicked: ref<(() => void) | null>(null),
	});
}
class BackdropsService {
	backdrops: BackdropController[] = [];

	push(options: BackdropOptions) {
		const scrollbarWidth = window.innerWidth - document.body.clientWidth;
		const backdrop = createBackdrop({
			...options,
			remove: () => Backdrop.remove(backdrop),
		}) as BackdropController;

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

	checkBackdrops() {
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

	private remove(backdrop: BackdropController) {
		arrayRemove(this.backdrops, i => i === backdrop);
		this.checkBackdrops();
	}
}

export const Backdrop = reactive(/** @__PURE__ */ new BackdropsService()) as BackdropsService;

export type BackdropController = ReturnType<typeof createBackdrop>;
