import { computed, inject, InjectionKey, Ref, ref, shallowReadonly } from 'vue';

import { isDynamicGoogleBot } from '~common/device/device.service';
import { EmojiGroupModel } from '~common/emoji/emoji-group.model';
import { getSsrContext } from '~common/environment/environment.service';
import { Navigate } from '~common/navigate/navigate.service';
import { defineIsolatedState } from '~common/ssr/isolated-state';
import { UserTimeoutModel } from '~common/user/timeout/timeout.model';
import { UserModel } from '~common/user/user.model';
import { loadScript } from '~utils/utils';

export interface EmojiGroupData {
	group: EmojiGroupModel;
	isLoading: boolean;
	isBootstrapped: boolean;
	hasError: boolean;
}

export const CommonStoreKey: InjectionKey<CommonStore> = Symbol('common-store');

export type CommonStore = ReturnType<typeof createCommonStore>;

const _storeHandle = defineIsolatedState(() => ({
	store: null as CommonStore | null,
}));

/**
 * For Vue components — prefer this over `getCommonStore()`.
 */
export function useCommonStore() {
	return inject(CommonStoreKey)!;
}

/**
 * Returns the common store for the current app/request scope. Use this
 * sparingly, only in non-Vue contexts where `useCommonStore()` isn't available.
 */
export function getCommonStore() {
	const store = _storeHandle().store;
	if (!store) {
		throw new Error(`CommonStore has not yet been set.`);
	}
	return store;
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

	function setError(newError: number | string) {
		error.value = newError;
		getSsrContext().errorCode = typeof newError === 'string' ? 500 : newError;
	}

	function clearError() {
		error.value = null;
	}

	function redirect(location: string) {
		if (import.meta.env.SSR) {
			getSsrContext().redirect = location;
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

		let deferredResolve = (_value: unknown) => {};
		let deferredReject = (_reason?: any) => {};
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

	const c = shallowReadonly({
		user,
		userBootstrapped,
		userBootstrappedPromise,
		reactionsData,
		reactionsCursor,
		error,
		timeout,
		isUserTimedOut,
		setUser,
		clearUser,
		setTimeout,
		setError,
		clearError,
		redirect,
		lazyLoadGlobalScript,
		coinBalance,
		joltbuxBalance,
		showInitialPackWatermark,
		setInitialPackWatermarkStorageValue,
	});

	_storeHandle().store = c;
	return c;
}
