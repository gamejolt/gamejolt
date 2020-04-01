import { Action, Mutation, namespace, State } from 'vuex-class';
import { VuexModule, VuexMutation, VuexStore } from '../../utils/vuex';
import { Environment } from '../environment/environment.service';
import { Navigate } from '../navigate/navigate.service';
import { User } from '../user/user.model';

export const AppState = namespace('app', State);
export const AppAction = namespace('app', Action);
export const AppMutation = namespace('app', Mutation);

export type Actions = {};

export type Mutations = {
	'app/setUser': any;
	'app/clearUser': undefined;
	'app/setConsents': UserConsents;
	'app/setError': number;
	'app/clearError': undefined;
	'app/redirect': string;
	'app/setHasNewStickers': boolean;
};

interface UserConsents {
	ads?: boolean;
	eea?: boolean;
}

const STICKER_LOCAL_STORAGE_NEW_KEY = 'gj-stickers-new-2';

@VuexModule()
export class AppStore extends VuexStore<AppStore, Actions, Mutations> {
	user: User | null = null;
	userBootstrapped = false;
	consents: UserConsents = {};
	error: number | string | null = null;
	hasNewStickers = false;

	@VuexMutation
	setUser(user: Mutations['app/setUser']) {
		if (this.user) {
			this.user.assign(user);
		} else {
			this.user = user;
		}
		this.userBootstrapped = true;

		// Set the new stickers indicator.
		const lsValue = localStorage.getItem(STICKER_LOCAL_STORAGE_NEW_KEY);
		// TODO: Remove the null check when we don't want to show NEW by default anymore.
		this.hasNewStickers = lsValue === '1' || lsValue === null;
	}

	@VuexMutation
	clearUser() {
		this.user = null;
		this.userBootstrapped = true;
	}

	@VuexMutation
	setConsents(consents: Mutations['app/setConsents']) {
		this.consents = consents;
	}

	@VuexMutation
	setError(error: Mutations['app/setError']) {
		this.error = error;
		Environment.ssrContext.errorCode = typeof error === 'string' ? 500 : error;
	}

	@VuexMutation
	clearError() {
		this.error = null;
	}

	@VuexMutation
	redirect(location: Mutations['app/redirect']) {
		if (GJ_IS_SSR) {
			Environment.ssrContext.redirect = location;
		} else {
			Navigate.goto(location);
		}
	}

	@VuexMutation
	setHasNewStickers(has: Mutations['app/setHasNewStickers']) {
		if (this.userBootstrapped) {
			this.hasNewStickers = has;

			localStorage.setItem(STICKER_LOCAL_STORAGE_NEW_KEY, has ? '1' : '0');
		}
	}
}

export const appStore = new AppStore();
