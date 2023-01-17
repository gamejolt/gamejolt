import { inject, InjectionKey, ref, Ref } from 'vue';
import { Realm } from '../../../../_common/realm/realm-model';

export const RealmRouteStoreKey: InjectionKey<RealmRouteStore> = Symbol('realm-store');

export type RealmRouteStore = ReturnType<typeof createRealmRouteStore>;

export function createRealmRouteStore() {
	const realm = ref() as Ref<Realm>;

	return {
		realm,
	};
}

export function useRealmRouteStore() {
	return inject(RealmRouteStoreKey)!;
}
