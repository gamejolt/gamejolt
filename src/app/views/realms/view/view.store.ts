import { inject, InjectionKey, ref } from 'vue';
import { FiresideModel } from '../../../../_common/fireside/fireside.model';
import { ModelData } from '../../../../_common/model/model.service';
import { RealmModel } from '../../../../_common/realm/realm-model';
import { UserModel } from '../../../../_common/user/user.model';

export const RealmRouteStoreKey: InjectionKey<RealmRouteStore> = Symbol('realm-store');

export type RealmRouteStore = ReturnType<typeof createRealmRouteStore>;

export type RealmRoutePayload = {
	realm: ModelData<RealmModel>;
	knownFollowers: ModelData<UserModel>[];
	knownFollowerCount: number;
	activeFiresides: ModelData<FiresideModel>[];
	userFireside: ModelData<FiresideModel> | undefined;
	userHasFireside: boolean;
};

export function createRealmRouteStore() {
	const realm = ref<RealmModel>();
	const knownFollowers = ref<UserModel[]>([]);
	const knownFollowerCount = ref(0);
	const firesides = ref<FiresideModel[]>([]);
	const userFireside = ref<FiresideModel>();
	const userHasFireside = ref(false);

	const processPayload = (payload: RealmRoutePayload) => {
		realm.value = new RealmModel(payload.realm);
		knownFollowers.value = UserModel.populate(payload.knownFollowers);
		knownFollowerCount.value = payload.knownFollowerCount || 0;
		firesides.value = FiresideModel.populate(payload.activeFiresides);
		if (payload.userFireside) {
			userFireside.value = new FiresideModel(payload.userFireside);
		}
		userHasFireside.value = payload.userHasFireside;
	};

	return {
		realm,
		knownFollowers,
		knownFollowerCount,
		firesides,
		userFireside,
		userHasFireside,
		processPayload,
	};
}

export function useRealmRouteStore() {
	return inject(RealmRouteStoreKey)!;
}
