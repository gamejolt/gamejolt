import { inject, InjectionKey, ref, shallowReadonly } from 'vue';

import { UserModel } from '~common/user/user.model';

export type JoltydexStore = ReturnType<typeof createJoltydexStore>;

export const JoltydexStoreKey: InjectionKey<JoltydexStore> = Symbol('joltydex-store');

export function useJoltydexStore() {
	return inject(JoltydexStoreKey)!;
}

export function createJoltydexStore() {
	const selectedJoltydexUser = ref<UserModel>();

	return shallowReadonly({
		selectedJoltydexUser,
	});
}
