import { MaybeRef, inject, markRaw, reactive, ref, type Component } from 'vue';
import { arrayRemove } from '../../utils/array';
import { Popper } from '../popper/popper.service';

export const ModalKey = Symbol('modal-key');

export function useModal<T>() {
	return inject(ModalKey, null) as Modal<T> | null;
}

export type ModalDismissReason = 'route-change' | 'esc' | 'backdrop' | 'manual';

export interface ModalOptions {
	component: Component;
	modalId: string;
	size?: MaybeRef<'xs' | 'sm' | 'lg' | 'full' | undefined>;
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
		return Modals.modals.findIndex(i => i === this);
	}

	constructor(public id: number, private _resolve: (value?: T) => void, options: ModalOptions) {
		// avert your eyes
		this.size = ref(options.size) as unknown as Modal['size'];
		this.component = markRaw(options.component);
		this.props = options.props;
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

class ModalsService {
	modals: Modal[] = [];
	incrementer = 0;

	/**
	 * Can be set within a section to define a wrapping component for all modal
	 * bodies.
	 */
	modalBodyWrapper?: Component;
}

export const Modals = reactive(new ModalsService()) as ModalsService;

function _canAddToStack(id: string | undefined) {
	if (id) {
		return !Modals.modals.some(i => i.modalId === id);
	}
	return true;
}

export function showModal<T>(options: ModalOptions) {
	return new Promise<T | undefined>(resolve => {
		if (_canAddToStack(options.modalId)) {
			Popper.hideAll();
			++Modals.incrementer;
			const modal = new Modal(Modals.incrementer, resolve, options);
			Modals.modals.push(modal);
		}
	});
}

export function findModalById(modalId: string) {
	return Modals.modals.filter(i => i.modalId === modalId);
}

function _removeModal(modal: Modal) {
	arrayRemove(Modals.modals, i => i.id === modal.id);
}

export function setModalBodyWrapper(component: Component) {
	Modals.modalBodyWrapper = markRaw(component);
}
