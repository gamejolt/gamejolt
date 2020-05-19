import { arrayRemove } from '../../utils/array';
import AppPopper from './popper';

export class Popper {
	static poppers: AppPopper[] = [];
	static stateChangeRegistered = false;

	static registerPopper(router: any, popper: AppPopper) {
		this.poppers.push(popper);

		// Have to do this because we still use angular. Once we switch off we
		// can do this outside the class.
		if (!this.stateChangeRegistered) {
			this.stateChangeRegistered = true;

			if (router) {
				router.beforeEach((_to: any, _from: any, next: Function) => {
					this.hideStateChange();
					next();
				});
			}
		}
	}

	static deregisterPopper(popper: AppPopper) {
		arrayRemove(this.poppers, i => i === popper);
	}

	static hideAll() {
		for (const popper of this.poppers) {
			if (popper.trigger === 'manual') {
				continue;
			}

			if (popper.isVisible) {
				popper.hide();
			}
		}
	}

	private static hideStateChange() {
		for (const popper of this.poppers) {
			if (popper.isVisible && popper.hideOnStateChange) {
				popper.hide();
			}
		}
	}
}
