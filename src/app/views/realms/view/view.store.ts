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
};

export function createRealmRouteStore() {
	const realm = ref<Realm>();
	const knownFollowers = ref<User[]>([]);
	const knownFollowerCount = ref(0);
	const firesides = ref<Fireside[]>([]);

	const processPayload = (payload: RealmRoutePayload) => {
		realm.value = new Realm(payload.realm);
		knownFollowers.value = User.populate(payload.knownFollowers);
		knownFollowerCount.value = payload.knownFollowerCount || 0;
		firesides.value = Fireside.populate(payload.activeFiresides);
	};

	return {
		realm,
		knownFollowers,
		knownFollowerCount,
		firesides,
		processPayload,
	};
}

export function useRealmRouteStore() {
	return inject(RealmRouteStoreKey)!;
}
