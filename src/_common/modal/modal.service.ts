import { Component, markRaw, reactive } from 'vue';
import { arrayRemove } from '../../utils/array';
import { Popper } from '../popper/popper.service';

export const ModalKey = Symbol('modal-key');

export interface ModalOptions {
	component: Component;
	modalId: string;
	size?: 'sm' | 'lg' | 'full' | undefined;
	props?: any;
	noBackdrop?: boolean;
	noBackdropClose?: boolean;
	noEscClose?: boolean;
}

export class Modal<T = any> {
	size: 'sm' | 'lg' | 'full' | undefined;
	component: Component;
	modalId: string;
	props?: any;
	noBackdrop?: boolean;
	noBackdropClose?: boolean;
	noEscClose?: boolean;

	get index(): number {
		return Modals.modals.findIndex(i => i === this);
	}

	constructor(public id: number, private _resolve: (value?: T) => void, options: ModalOptions) {
		this.size = options.size;
		this.component = markRaw(options.component);
		this.props = options.props;
		this.noBackdrop = options.noBackdrop;
		this.noBackdropClose = options.noBackdropClose;
		this.noEscClose = options.noEscClose;
		this.modalId = options.modalId;
	}

	resolve(val?: T) {
		_removeModal(this);
		this._resolve(val);
	}

	dismiss() {
		_removeModal(this);
		this._resolve(undefined);
	}
}

class ModalsService {
	modals: Modal[] = [];
	incrementer = 0;
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

function _removeModal(modal: Modal) {
	arrayRemove(Modals.modals, i => i.id === modal.id);
}
