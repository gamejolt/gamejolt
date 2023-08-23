import { markRaw, reactive, type Component } from 'vue';
import { arrayRemove } from '../../utils/array';
import { Client } from '../client/safe-exports';
import { Translate } from '../translate/translate.service';

export type GrowlType = 'info' | 'success' | 'error';

export interface GrowlOptions {
	message?: string;
	title?: string;
	sticky?: boolean;
	onClick?: (event: Event) => void;
	icon?: string;
	component?: Component;
	props?: any;
	system?: boolean;
}

export class Growl {
	title?: string;
	message?: string;
	component?: Component;
	props?: any;
	sticky: boolean;
	icon?: string;
	onClick?: (event: Event) => void;
	system: boolean;

	constructor(public id: number, public type: GrowlType, options: GrowlOptions) {
		this.title = options.title;
		this.message = options.message;
		this.component = options.component ? markRaw(options.component) : undefined;
		this.props = options.props;
		this.sticky = !!options.sticky;
		this.icon = options.icon;
		this.onClick = options.onClick;
		this.system = options.system ?? false;
	}

	close() {
		arrayRemove(Growls.growls, i => i.id === this.id);
	}
}

class GrowlsService {
	incrementer = 0;
	growls: Growl[] = [];
}

export const Growls = reactive(new GrowlsService()) as GrowlsService;

function _addGrowl(type: GrowlType, options: GrowlOptions) {
	if (!options.title) {
		if (type === 'error') {
			options.title = Translate.$gettext('Oh no!');
		} else if (type === 'success') {
			options.title = Translate.$gettext('Huzzah!');
		}
	}

	// If we're a client or have notifications permissions in browser, we want
	// to instead show this as a system notification.
	if (options.system && (GJ_IS_DESKTOP_APP || (Notification as any).permission === 'granted')) {
		return _createSystemNotification(options);
	}

	++Growls.incrementer;
	const growl = new Growl(Growls.incrementer, type, options);
	Growls.growls.push(growl);
}

function _createSystemNotification(options: GrowlOptions) {
	let title = options.title;
	let message = options.message;

	// If no title passed in, make the body the title.
	if (!title) {
		if (!message) {
			return;
		}
		title = message;
		message = undefined;
	}

	const notification = new Notification(title, {
		body: message,
		icon: options.icon,
	});

	notification.onclick = event => {
		Client?.show();

		if (options.onClick) {
			options.onClick(event);
			notification.close();
		}
	};
}

export function showSuccessGrowl(data: GrowlOptions): void;
export function showSuccessGrowl(message: string, title?: string): void;
export function showSuccessGrowl(data: string | GrowlOptions, title?: string) {
	_addGrowl('success', typeof data === 'string' ? { message: data, title } : data);
}

export function showInfoGrowl(data: GrowlOptions): void;
export function showInfoGrowl(message: string, title?: string): void;
export function showInfoGrowl(data: string | GrowlOptions, title?: string) {
	_addGrowl('info', typeof data === 'string' ? { message: data, title } : data);
}

export function showErrorGrowl(data: GrowlOptions): void;
export function showErrorGrowl(message: string, title?: string): void;
export function showErrorGrowl(data: string | GrowlOptions, title?: string) {
	_addGrowl('error', typeof data === 'string' ? { message: data, title } : data);
}
