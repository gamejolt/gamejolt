import { inject, InjectionKey, Ref, ref } from 'vue';
import { InventoryCollection } from '../../../_common/inventory/collection.model';
import { ModelData } from '../../../_common/model/model.service';
import { User } from '../../../_common/user/user.model';

export const CollectionsRouteStoreKey: InjectionKey<CollectionsRouteStore> =
	Symbol('collections-store');

export type CollectionsRouteStore = ReturnType<typeof createCollectionsRouteStore>;

export type CollectionsRoutePayload = {
	collections: ModelData<InventoryCollection>[];
	user: ModelData<User>;
};

export function createCollectionsRouteStore() {
	const collections = ref([]) as Ref<InventoryCollection[]>;
	const user = ref<User>();
	/** Collection that is currently being viewed. */
	const viewingCollection = ref<InventoryCollection | null>(null);

	const processPayload = (payload: CollectionsRoutePayload) => {
		collections.value = InventoryCollection.populate(payload.collections);
		user.value = new User(payload.user);
		viewingCollection.value = null;
	};

	return { collections, user, processPayload, viewingCollection };
}

export function useCollectionsRouteStore() {
	return inject(CollectionsRouteStoreKey)!;
}
