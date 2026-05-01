import { defineIsolatedState } from '~common/ssr/isolated-state';

export interface PopperComponentInterface {
	onHideAll: () => void;
}

const _interfaces = defineIsolatedState(() => new Map<number, PopperComponentInterface>());

export function registerPopper(id: number, popper: PopperComponentInterface) {
	_interfaces().set(id, popper);
}

export function deregisterPopper(id: number) {
	_interfaces().delete(id);
}

export function hideAllPoppers() {
	for (const popper of _interfaces().values()) {
		popper.onHideAll();
	}
}
