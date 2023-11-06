import { computed, ref, shallowReadonly } from 'vue';
import { Api } from '../api/api.service';
import { CollectibleModel, CollectibleType } from '../collectible/collectible.model';
import { storeModelList } from '../model/model-store.service';
import { UserModel } from '../user/user.model';

// TODO(collectible-sales) revisit this
export type JoltydexFeed = ReturnType<typeof makeJoltydexFeed>;
// export interface JoltydexFeedItem {
// 	collectible: CollectibleModel;
// 	sale?: InventoryShopProductSaleModel;
// }
export interface JoltydexFeedItem extends CollectibleModel {}

export function makeJoltydexFeed(type: CollectibleType) {
	const collectibles = ref<JoltydexFeedItem[]>([]);
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
			// TODO(collectible-sales) revisit this
			// collectibleSales: {
			// 	...commonFields,
			// 	perPage,
			// 	pos,
			// },
			collectibleCount: {
				...commonFields,
			},
		},
		{ detach: true }
	);

	const collectibles = new Map<CollectibleType, JoltydexFeedItem[]>();

	// TODO(collectible-sales) revisit this
	if (false) {
		// for (const type of types) {
		// 	// Unsupported type, ignore.
		// 	if (!payload.collectibles[type]) {
		// 		continue;
		// 	}
		// 	const collectiblesForType = storeModelList(
		// 		CollectibleModel,
		// 		payload.collectibles[type]
		// 	);
		// 	const salesForType = payload.collectibleSales[type] as Record<
		// 		number,
		// 		PartialModelData<InventoryShopProductSaleModel>[]
		// 	>;
		// 	collectibles.set(
		// 		type,
		// 		collectiblesForType.map(collectible => {
		// 			let sale: InventoryShopProductSaleModel | undefined;
		// 			// CollectibleModel id is a string with the typename prepended,
		// 			// so we need to strip it out.
		// 			const id = parseInt(collectible.id.replaceAll(/[^\d]/g, ''), 10);
		// 			if (id) {
		// 				const sales = salesForType[id];
		// 				if (sales && sales.length) {
		// 					sale = storeModel(InventoryShopProductSaleModel, sales[0]);
		// 				}
		// 			}
		// 			return {
		// 				collectible,
		// 				sale,
		// 			};
		// 		})
		// 	);
		// }
	} else {
		for (const type of types) {
			if (payload.collectibles[type]) {
				collectibles.set(
					type,
					storeModelList(CollectibleModel, payload.collectibles[type])
				);
			}
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
