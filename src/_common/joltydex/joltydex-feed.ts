import { computed, ref, shallowReadonly } from 'vue';
import { Api } from '../api/api.service';
import { CollectibleModel, CollectibleType } from '../collectible/collectible.model';
import { storeModelList } from '../model/model-store.service';
import { UserModel } from '../user/user.model';

export type JoltydexFeed = ReturnType<typeof makeJoltydexFeed>;

export function makeJoltydexFeed(type: CollectibleType) {
	const collectibles = ref<CollectibleModel[]>([]);
	const count = ref(0);
	const isLoading = ref(false);

	const reachedEnd = computed(() => collectibles.value.length >= count.value);

	return shallowReadonly({
		type,
		collectibles,
		count,
		isLoading,
		reachedEnd,
	});
}

export async function loadJoltydexFeed({
	types,
	ownerUser,
	user,
	pos,
	perPage,
}: {
	types: CollectibleType[];
	/** The user that is providing these collectibles. */
	ownerUser: UserModel;
	/** The user that has unlocked the items. */
	user: UserModel;
	pos?: number;
	perPage?: number;
}) {
	const commonFields = {
		ownerUser: ownerUser.id,
		user: user.id,
		resourceTypes: types,
	};

	const payload = await Api.sendFieldsRequest(
		'/mobile/inventory-collection',
		{
			collectibles: {
				...commonFields,
				perPage,
				pos,
			},
			collectibleCount: {
				...commonFields,
			},
		},
		{ detach: true }
	);

	const collectibles = new Map<CollectibleType, CollectibleModel[]>();
	for (const type of types) {
		if (payload.collectibles[type]) {
			collectibles.set(type, storeModelList(CollectibleModel, payload.collectibles[type]));
		}
	}

	return {
		collectibles,
		counts: payload.collectibleCount,
	};
}

export function applyPayloadToJoltydexFeed(
	payload: Awaited<ReturnType<typeof loadJoltydexFeed>>,
	feed: JoltydexFeed
) {
	feed.count.value = payload.counts[feed.type] || 0;
	feed.collectibles.value.push(...(payload.collectibles.get(feed.type) || []));
}
