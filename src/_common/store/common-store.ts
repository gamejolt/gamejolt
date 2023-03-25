import { computed, inject, InjectionKey, ref, Ref } from 'vue';
import { EmojiGroup } from '../emoji/emoji-group.model';
import { Environment } from '../environment/environment.service';
import '../model/model.service';
import { Navigate } from '../navigate/navigate.service';
import { UserTimeout } from '../user/timeout/timeout.model';
import { User } from '../user/user.model';

interface UserConsents {
	ads?: boolean;
	eea?: boolean;
}

export interface EmojiGroupData {
	group: EmojiGroup;
	isLoading: boolean;
	isBootstrapped: boolean;
	hasError: boolean;
}

export const CommonStoreKey: InjectionKey<CommonStore> = Symbol('common-store');

export type CommonStore = ReturnType<typeof createCommonStore>;

export function useCommonStore() {
	return inject(CommonStoreKey)!;
}

export function createCommonStore() {
	const user = ref<User | null>(null);
	const userBootstrapped = ref(false);

	const reactionsData = ref(new Map()) as Ref<Map<number, EmojiGroupData>>;
	const reactionsCursor = ref<string>();

	const consents = ref<UserConsents>({});
	const error = ref<number | string | null>(null);
	const timeout = ref<UserTimeout | null>(null);

	// Wallet currencies.
	const coinBalance = ref(0);

	const isUserTimedOut = computed(() => {
		return (
			userBootstrapped.value && !!user.value && !!timeout.value && timeout.value.getIsActive()
		);
	});

	function setUser(newUser: any) {
		if (user.value) {
			user.value.assign(newUser);
		} else {
			user.value = new User(newUser);
		}

		if (newUser.timeout) {
			const timeout = new UserTimeout(newUser.timeout);
			setTimeout(timeout);
		} else {
			timeout.value = null;
		}

		userBootstrapped.value = true;
	}

	function setTimeout(newTimeout: UserTimeout) {
		if (!newTimeout.getIsActive()) {
			timeout.value = null;
		} else {
			console.info('The user is timed out.', newTimeout.expires_on);
			timeout.value = newTimeout;
		}
	}

	function clearUser() {
		user.value = null;
		userBootstrapped.value = true;
		reactionsData.value = new Map();
		coinBalance.value = 0;
	}

	function setConsents(newConsents: UserConsents) {
		consents.value = newConsents;
	}

	function setError(newError: number | string) {
		error.value = newError;
		Environment.ssrContext.errorCode = typeof newError === 'string' ? 500 : newError;
	}

	function clearError() {
		error.value = null;
	}

	function redirect(location: string) {
		if (import.meta.env.SSR) {
			Environment.ssrContext.redirect = location;
		} else {
			Navigate.goto(location);
		}
	}

	return {
		user,
		userBootstrapped,
		reactionsData,
		reactionsCursor,
		consents,
		error,
		timeout,
		isUserTimedOut,
		setUser,
		clearUser,
		setTimeout,
		setConsents,
		setError,
		clearError,
		redirect,
		coinBalance,
	};
}

export const commonStore = createCommonStore();
