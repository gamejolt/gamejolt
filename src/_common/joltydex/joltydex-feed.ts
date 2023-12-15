import { computed, ref, shallowReadonly } from 'vue';
import { arrayUnique } from '../../utils/array';
import { isInstance } from '../../utils/utils';
import { Api } from '../api/api.service';
import {
	AcquisitionMethod,
	AcquisitionModel,
	filterAcquisitionMethods,
} from '../collectible/acquisition.model';
import { CollectibleModel, CollectibleType } from '../collectible/collectible.model';
import { storeModelList } from '../model/model-store.service';
import { StickerPackModel } from '../sticker/pack/pack.model';
import { UserModel } from '../user/user.model';

export type JoltydexFeed = ReturnType<typeof makeJoltydexFeed>;

/**
 * Can either be a sticker pack or some info about a pack we're trying to fetch.
 *
 * @see loading will be `true` if we're actively fetching a pack, or `false` if
 * we did request it and it wasn't found.
 */
export type JoltydexMaybePack = { id: number; loading: boolean } | StickerPackModel;

export function makeJoltydexFeed(type: CollectibleType) {
	const collectibles = ref<CollectibleModel[]>([]);
	const count = ref(0);
	const isLoading = ref(false);

	const reachedEnd = computed(() => collectibles.value.length >= count.value);

	/**
	 * Contains a map of sticker pack IDs to either the pack or loading state
	 * for the pack.
	 */
	const _packLoadingData = ref(new Map<number, JoltydexMaybePack>());

	/**
	 * Gets sticker packs that are loaded in or currently loading.
	 */
	function getAcquisitionPacks(acquisitions: AcquisitionModel[]) {
		const packOpenAcquisitions = filterAcquisitionMethods(
			acquisitions,
			AcquisitionMethod.PackOpen
		);
		return packOpenAcquisitions.reduce((packs, i) => {
			const packData = _packLoadingData.value.get(i.sticker_pack_id);
			if (packData && (isInstance(packData, StickerPackModel) || packData.loading)) {
				packs.push(packData);
			}
			return packs;
		}, [] as JoltydexMaybePack[]);
	}

	/**
	 * Fetches packs from a list of IDs.
	 *
	 * Ignores packs that are currently loading, have loaded in, or were not
	 * found.
	 */
	async function _loadPacks(packIds: number[]) {
		const packsRequiringLoad = arrayUnique(packIds.filter(i => !_packLoadingData.value.has(i)));
		if (!packsRequiringLoad.length) {
			return;
		}
		for (const packId of packsRequiringLoad) {
			// Mark packs as loading so we can show loading states.
			_packLoadingData.value.set(packId, { id: packId, loading: true });
		}
		try {
			const payload = await Api.sendFieldsRequest(
				`/mobile/sticker`,
				{
					packs: {
						id: packsRequiringLoad,
					},
				},
				{ detach: true }
			);

			const packs = new Map(
				storeModelList(StickerPackModel, payload.packs).map(i => [i.id, i])
			);
			for (const id of packsRequiringLoad) {
				const pack = packs.get(id);
				if (pack) {
					_packLoadingData.value.set(id, pack);
				} else {
					// Mark this pack as not found so we don't try to load it again.
					_packLoadingData.value.set(id, { id, loading: false });
				}
			}
		} catch (e) {
			console.error('Failed to load packs for pack IDs', e, packIds);
			for (const id of packsRequiringLoad) {
				// Unset all packs that failed to load.
				const packData = _packLoadingData.value.get(id);
				if (packData && !isInstance(packData, StickerPackModel)) {
					_packLoadingData.value.delete(id);
				}
			}
		}
	}

	return shallowReadonly({
		type,
		collectibles,
		count,
		isLoading,
		reachedEnd,
		getAcquisitionPacks,
		_loadPacks,
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
	const newCollectibles = payload.collectibles.get(feed.type) || [];
	feed.collectibles.value.push(...newCollectibles);

	// Gather all sticker pack IDs for collectibles and fetch them immediately
	// so they're loaded in before the collectible details are viewed.
	const packIds: number[] = [];
	for (const collectible of newCollectibles) {
		const packIdsForCollectible = filterAcquisitionMethods(
			collectible.acquisition,
			AcquisitionMethod.PackOpen
		).map(i => i.sticker_pack_id);
		packIds.push(...packIdsForCollectible);
	}
	feed._loadPacks(packIds);
}
