import { inject, InjectionKey, ref } from 'vue';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { ModelData } from '../../../../_common/model/model.service';
import { Realm } from '../../../../_common/realm/realm-model';
import { User } from '../../../../_common/user/user.model';

export const RealmRouteStoreKey: InjectionKey<RealmRouteStore> = Symbol('realm-store');

export type RealmRouteStore = ReturnType<typeof createRealmRouteStore>;

export type RealmRoutePayload = {
	realm: ModelData<Realm>;
	knownFollowers: ModelData<User>[];
	knownFollowerCount: number;
	activeFiresides: ModelData<Fireside>[];
	userFireside: ModelData<Fireside> | undefined;
	userHasFireside: boolean;
};

export function createRealmRouteStore() {
	const realm = ref<Realm>();
	const knownFollowers = ref<User[]>([]);
	const knownFollowerCount = ref(0);
	const firesides = ref<Fireside[]>([]);
	const userFireside = ref<Fireside>();
	const userHasFireside = ref(false);

	const processPayload = (payload: RealmRoutePayload) => {
		realm.value = new Realm(payload.realm);
		knownFollowers.value = User.populate(payload.knownFollowers);
		knownFollowerCount.value = payload.knownFollowerCount || 0;
		firesides.value = Fireside.populate(payload.activeFiresides);
		if (payload.userFireside) {
			userFireside.value = new Fireside(payload.userFireside);
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
