import { type Component, inject, markRaw, ref, shallowRef } from 'vue';

import { hideAllPoppers } from '~common/popper/popper.service';
import { defineIsolatedState } from '~common/ssr/isolated-state';
import { arrayRemove } from '~utils/array';

export const ModalKey = Symbol('modal-key');

export function useModal<T>() {
	return inject(ModalKey, null) as Modal<T> | null;
}

export type ModalDismissReason = 'route-change' | 'esc' | 'backdrop' | 'manual';

export interface ModalOptions {
	component: Component;
	modalId: string;
	size?: 'xs' | 'sm' | 'lg' | 'full';
	props?: any;
	noBackdrop?: boolean;
	noBackdropClose?: boolean;
	noEscClose?: boolean;
	/**
	 * When the modal is dismissed rather than resolved, this callback will be
	 * called with the reason why the dismiss was triggered.
	 */
	onDismiss?: (reason: ModalDismissReason) => void;
}

export class Modal<T = any> {
	size: 'xs' | 'sm' | 'lg' | 'full' | undefined;
	component: Component;
	modalId: string;
	props?: any;
	noBackdrop?: boolean;
	noBackdropClose?: boolean;
	noEscClose?: boolean;
	onDismiss?: (reason: ModalDismissReason) => void;

	get index(): number {
		return Modals.modals.value.findIndex(i => i === this);
	}

	constructor(
		public id: number,
		public _resolve: (value?: T) => void,
		options: ModalOptions
	) {
		this.size = options.size;
		this.component = markRaw(options.component);
		// Mark props raw so the reactive array doesn't deep-wrap them — otherwise
		// nested refs (e.g. on a controller/store passed in as a prop) get
		// auto-unwrapped and callers hit `undefined` when they read `.value`.
		this.props = options.props ? markRaw(options.props) : options.props;
		this.noBackdrop = options.noBackdrop;
		this.noBackdropClose = options.noBackdropClose;
		this.noEscClose = options.noEscClose;
		this.modalId = options.modalId;
		this.onDismiss = options.onDismiss;
	}

	resolve(val?: T) {
		_removeModal(this);
		this._resolve(val);
	}

	dismiss(reason?: ModalDismissReason) {
		_removeModal(this);
		this._resolve(undefined);
		this.onDismiss?.(reason || 'manual');
	}
}

const _state = defineIsolatedState(() => ({
	modals: ref<Modal[]>([]),
	incrementer: ref(0),
	/**
	 * Can be set within a section to define a wrapping component for all modal
	 * bodies.
	 */
	modalBodyWrapper: shallowRef<Component | undefined>(undefined),
}));

export const Modals = {
	get modals() {
		return _state().modals;
	},
	get incrementer() {
		return _state().incrementer;
	},
	get modalBodyWrapper() {
		return _state().modalBodyWrapper;
	},
};

function _canAddToStack(id: string | undefined) {
	if (id) {
		return !Modals.modals.value.some(i => i.modalId === id);
	}
	return true;
}

export function showModal<T>(options: ModalOptions) {
	return new Promise<T | undefined>(resolve => {
		if (import.meta.env.SSR) {
			resolve(undefined);
			return;
		}

		if (_canAddToStack(options.modalId)) {
			hideAllPoppers();
			++Modals.incrementer.value;
			const modal = new Modal(Modals.incrementer.value, resolve, options);
			Modals.modals.value.push(modal);
		}
	});
}

export function findModalById(modalId: string) {
	return Modals.modals.value.filter(i => i.modalId === modalId);
}

function _removeModal(modal: Modal) {
	if (import.meta.env.SSR) {
		return;
	}
	arrayRemove(Modals.modals.value, i => i.id === modal.id);
}

export function setModalBodyWrapper(component: Component) {
	if (import.meta.env.SSR) {
		return;
	}
	Modals.modalBodyWrapper.value = component;
}
