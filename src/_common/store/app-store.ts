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
};

interface UserConsents {
	ads?: boolean;
	eea?: boolean;
}

@VuexModule()
export class AppStore extends VuexStore<AppStore, Actions, Mutations> {
	user: User | null = null;
	userBootstrapped = false;
	consents: UserConsents = {};
	error: number | string | null = null;

	@VuexMutation
	setUser(user: Mutations['app/setUser']) {
		if (this.user) {
			this.user.assign(user);
		} else {
			this.user = user;
		}
		this.userBootstrapped = true;
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
}

export const appStore = new AppStore();
