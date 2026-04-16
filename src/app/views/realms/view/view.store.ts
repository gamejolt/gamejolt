import { inject, InjectionKey, ref } from 'vue';

import { ModelData } from '~common/model/model.service';
import { RealmModel } from '~common/realm/realm-model';
import { UserModel } from '~common/user/user.model';

export const RealmRouteStoreKey: InjectionKey<RealmRouteStore> = Symbol('realm-store');

export type RealmRouteStore = ReturnType<typeof createRealmRouteStore>;

export type RealmRoutePayload = {
	realm: ModelData<RealmModel>;
	knownFollowers: ModelData<UserModel>[];
	knownFollowerCount: number;
};

export function createRealmRouteStore() {
	const realm = ref<RealmModel>();
	const knownFollowers = ref<UserModel[]>([]);
	const knownFollowerCount = ref(0);

	const processPayload = (payload: RealmRoutePayload) => {
		realm.value = new RealmModel(payload.realm);
		knownFollowers.value = UserModel.populate(payload.knownFollowers);
		knownFollowerCount.value = payload.knownFollowerCount || 0;
	};

	return {
		realm,
		knownFollowers,
		knownFollowerCount,
		processPayload,
	};
}

export function useRealmRouteStore() {
	return inject(RealmRouteStoreKey)!;
}
