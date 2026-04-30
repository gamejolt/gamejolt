import {
	inject,
	InjectionKey,
	MaybeRefOrGetter,
	onUnmounted,
	ref,
	shallowReadonly,
	toValue,
	watch,
} from 'vue';

import { arrayRemove } from '~utils/array';

type EscapeStackCallback = () => void;

export type EscapeStackStore = ReturnType<typeof createEscapeStackStore>;

export const EscapeStackStoreKey: InjectionKey<EscapeStackStore> = Symbol('escape-stack-store');

export function createEscapeStackStore() {
	let initialized = false;

	const stack = ref<EscapeStackCallback[]>([]);

	function register(cb: EscapeStackCallback) {
		if (import.meta.env.SSR) {
			return;
		}

		stack.value.push(cb);
		_init();
	}

	function deregister(cb: EscapeStackCallback) {
		if (import.meta.env.SSR) {
			return;
		}

		arrayRemove(stack.value, i => i === cb);
	}

	function _handle(e: KeyboardEvent) {
		if (e.key !== 'Escape') {
			return;
		}

		const top = stack.value[stack.value.length - 1];
		if (top) {
			top();
		}
	}

	function _init() {
		if (initialized) {
			return;
		}

		document.addEventListener('keydown', _handle);
		initialized = true;
	}

	return shallowReadonly({
		stack,
		register,
		deregister,
	});
}

export function useEscapeStack({
	onEscape,
	enabled = true,
}: {
	onEscape: () => void;
	enabled?: MaybeRefOrGetter<boolean>;
}) {
	const store = inject(EscapeStackStoreKey)!;
	let isRegistered = false;

	function _setEnabled(value: boolean) {
		if (value && !isRegistered) {
			store.register(onEscape);
			isRegistered = true;
		} else if (!value && isRegistered) {
			store.deregister(onEscape);
			isRegistered = false;
		}
	}

	watch(() => toValue(enabled), _setEnabled, { immediate: true });

	onUnmounted(() => {
		_setEnabled(false);
	});
}
