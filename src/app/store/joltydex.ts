import { InjectionKey, inject, ref } from 'vue';
import { UserModel } from '../../_common/user/user.model';

export type JoltydexStore = ReturnType<typeof createJoltydexStore>;

export const JoltydexStoreKey: InjectionKey<JoltydexStore> = Symbol('joltydex-store');

export function useJoltydexStore() {
	return inject(JoltydexStoreKey)!;
}

export function createJoltydexStore() {
	const selectedJoltydexUser = ref<UserModel>();

	return {
		selectedJoltydexUser,
	};
}
