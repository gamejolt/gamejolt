import { computed, inject, InjectionKey, ref, Ref } from 'vue';
import { loadScript } from '../../utils/utils';
import { isDynamicGoogleBot } from '../device/device.service';
import { EmojiGroupModel } from '../emoji/emoji-group.model';
import { Environment } from '../environment/environment.service';
import '../model/model.service';
import { Navigate } from '../navigate/navigate.service';
import { UserTimeoutModel } from '../user/timeout/timeout.model';
import { UserModel } from '../user/user.model';

interface UserConsents {
	ads?: boolean;
	eea?: boolean;
}

export interface EmojiGroupData {
	group: EmojiGroupModel;
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
	const user = ref<UserModel | null>(null);
	const userBootstrapped = ref(false);

	let _resolveUserBootstrapped: (() => void) | null = null;
	const userBootstrappedPromise = new Promise<void>(resolve => {
		_resolveUserBootstrapped = resolve;
	});

	const lazyLoadedGlobalScripts = ref(new Map<string, Promise<unknown>>());

	const reactionsData = ref(new Map()) as Ref<Map<number, EmojiGroupData>>;
	const reactionsCursor = ref<string>();

	const consents = ref<UserConsents>({});
	const error = ref<number | string | null>(null);
	const timeout = ref<UserTimeoutModel | null>(null);

	// Wallet currencies.
	const coinBalance = ref(0);
	const joltbuxBalance = ref(0);

	/**
	 * Shows a notification blip on the Backpack cbar item.
	 */
	const showInitialPackWatermark = ref(false);

	function getInitialPackWatermarkStorageKey() {
		if (!user.value) {
			return null;
		}
		return `initial_pack_watermark/${user.value.id}`;
	}

	function getInitialPackWatermarkStorageValue() {
		const key = getInitialPackWatermarkStorageKey();
		if (!key) {
			return false;
		}
		return localStorage.getItem(key) === '1';
	}

	function setInitialPackWatermarkStorageValue(value: boolean) {
		showInitialPackWatermark.value = value;

		const key = getInitialPackWatermarkStorageKey();
		if (!key) {
			console.error('Invalid key for initial pack watermark storage.');
			return;
		}

		if (value) {
			localStorage.setItem(key, '1');
		} else {
			localStorage.removeItem(key);
		}
	}

	const isUserTimedOut = computed(() => {
		return (
			userBootstrapped.value && !!user.value && !!timeout.value && timeout.value.getIsActive()
		);
	});

	function setUser(newUser: any) {
		if (user.value) {
			user.value.assign(newUser);
		} else {
			user.value = new UserModel(newUser);

			if (getInitialPackWatermarkStorageValue()) {
				showInitialPackWatermark.value = true;
			}
		}

		if (newUser.timeout) {
			const timeout = new UserTimeoutModel(newUser.timeout);
			setTimeout(timeout);
		} else {
			timeout.value = null;
		}

		userBootstrapped.value = true;
		_resolveUserBootstrapped?.();
	}

	function setTimeout(newTimeout: UserTimeoutModel) {
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
		_resolveUserBootstrapped?.();
		reactionsData.value = new Map();
		coinBalance.value = 0;
		joltbuxBalance.value = 0;
		showInitialPackWatermark.value = false;
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

	/**
	 * Lazy loads an external script by url by adding it as a <script> tag to the document head.
	 *
	 * Notes:
	 * - Scripts will only be required once.
	 * - Scripts by default do not load in SSR.
	 * - Scripts by default do not load for GoogleBot.
	 *
	 * @return A promise that resolves when the script has been loaded.
	 */
	async function lazyLoadGlobalScript(
		src: string,
		{ allowSSR, allowGoogleBot }: { allowSSR?: boolean; allowGoogleBot?: boolean } = {
			allowSSR: false,
			allowGoogleBot: false,
		}
	) {
		if (lazyLoadedGlobalScripts.value.has(src)) {
			return lazyLoadedGlobalScripts.value.get(src);
		}

		if (!allowSSR && import.meta.env.SSR) {
			return Promise.resolve(null);
		}

		if (!allowGoogleBot && isDynamicGoogleBot()) {
			return Promise.resolve(null);
		}

		let deferredResolve = (value: unknown) => {};
		let deferredReject = (reason?: any) => {};
		const deferred = new Promise((resolve, reject) => {
			deferredResolve = resolve;
			deferredReject = reject;
		});

		lazyLoadedGlobalScripts.value.set(src, deferred);
		try {
			await loadScript(src);
			deferredResolve(true);
		} catch (e) {
			lazyLoadedGlobalScripts.value.delete(src);
			deferredReject(e);
		}

		return deferred;
	}

	return {
		user,
		userBootstrapped,
		userBootstrappedPromise,
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
		lazyLoadGlobalScript,
		coinBalance,
		joltbuxBalance,
		showInitialPackWatermark,
		setInitialPackWatermarkStorageValue,
	};
}

export const commonStore = createCommonStore();
