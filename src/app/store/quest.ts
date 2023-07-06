import { InjectionKey, Ref, computed, inject, ref, shallowReadonly, watch } from 'vue';
import { Api } from '../../_common/api/api.service';
import { storeModelList } from '../../_common/model/model-store.service';
import { Quest, QuestRepeatType } from '../../_common/quest/quest-model';
import { User } from '../../_common/user/user.model';
import { GridClient } from '../components/grid/client.service';

export type QuestStore = ReturnType<typeof createQuestStore>;
type QuestIdSet = Set<number>;

export const QuestStoreKey: InjectionKey<QuestStore> = Symbol('quest-store');

export function createQuestStore({
	user,
	grid,
}: {
	user: Ref<User | null>;
	grid: Ref<GridClient | undefined>;
}) {
	const isLoading = ref(false);
	const hasLoaded = ref(false);

	const allQuests = ref<Quest[]>([]);
	const dailyQuests = computed(() =>
		allQuests.value.filter(i => i.repeat_type === QuestRepeatType.daily)
	);

	const newQuestIdsForView = ref<QuestIdSet>(new Set());
	const newQuestIds = ref<QuestIdSet>(new Set());
	const questActivityIds = ref<QuestIdSet>(new Set());

	const activeQuest = ref() as Ref<number | Quest | undefined>;
	const activeQuestId = computed(() => {
		if (typeof activeQuest.value === 'number') {
			return activeQuest.value;
		}
		return activeQuest.value?.id;
	});
	const activeQuestResource = computed(() => {
		if (typeof activeQuest.value !== 'number') {
			return activeQuest.value;
		}
		return undefined;
	});

	function clearNewQuestIds(ids: number[] | 'all', { pushView }: { pushView: boolean }) {
		_clearQuestIds(newQuestIds, ids, { type: 'new-quest', pushView });
	}

	function clearQuestActivityIds(ids: number[] | 'all', { pushView }: { pushView: boolean }) {
		_clearQuestIds(questActivityIds, ids, { type: 'quest-activity', pushView });
	}

	function _clearQuestIds(
		list: Ref<QuestIdSet>,
		ids: number[] | 'all',
		{ type, pushView }: { type: 'new-quest' | 'quest-activity'; pushView: boolean }
	) {
		const clearIds = ids === 'all' ? [...list.value.values()] : ids;

		for (const questId of clearIds) {
			list.value.delete(questId);
			if (pushView) {
				grid.value?.pushViewNotifications(type, {
					questId,
				});
			}
		}
	}

	const _isLoadingDailyQuests = ref(false);

	function _addQuestIds(list: Ref<QuestIdSet>, ids: number[]) {
		for (const id of ids) {
			list.value.add(id);
		}
	}

	function _assignQuests(newQuests: Quest[]) {
		allQuests.value = newQuests;
		hasLoaded.value = true;
	}

	const c = shallowReadonly({
		isLoading,
		hasLoaded,
		allQuests,
		/**
		 * Only quests that are {@link QuestRepeatType.daily}.
		 */
		dailyQuests,
		newQuestIds,
		/**
		 * Quest IDs that should be shown in any "New Quests" sections.
		 */
		newQuestIdsForView,
		questActivityIds,
		/**
		 * The quest or quest ID that should be showing in the quest window.
		 */
		activeQuest,
		/**
		 * Helper to grab the id from {@link activeQuest}.
		 */
		activeQuestId,
		/**
		 * Helper to grab the {@link Quest} resource from {@link activeQuest}.
		 */
		activeQuestResource,
		clearNewQuestIds,
		clearQuestActivityIds,

		// Internal
		_isLoadingDailyQuests,
		_addQuestIds,
		_assignQuests,
	});

	// Reset this store when we lose our current user.
	watch(
		() => user.value,
		user => {
			if (user) {
				return;
			}

			_assignQuests([]);
			newQuestIdsForView.value.clear();
			clearNewQuestIds('all', { pushView: false });
			clearQuestActivityIds('all', { pushView: false });
			isLoading.value = true;
			hasLoaded.value = false;
			_isLoadingDailyQuests.value = false;
		}
	);

	return c;
}

function _clearUnknownQuestWatermarks(store: QuestStore) {
	const { allQuests, newQuestIds, questActivityIds, clearNewQuestIds, clearQuestActivityIds } =
		store;
	const _newIds = [...newQuestIds.value.values()];
	const _activityIds = [...questActivityIds.value.values()];
	const _currentQuestIds = new Set(allQuests.value.map(i => i.id));

	for (const id of _newIds) {
		if (!_currentQuestIds.has(id)) {
			clearNewQuestIds([id], { pushView: false });
		}
	}

	for (const id of _activityIds) {
		if (!_currentQuestIds.has(id)) {
			clearQuestActivityIds([id], { pushView: false });
		}
	}

	_currentQuestIds.clear();
}

export async function fetchAllQuests(store: QuestStore) {
	const { isLoading, hasLoaded, newQuestIdsForView, _assignQuests } = store;

	if (isLoading.value) {
		return;
	}
	isLoading.value = true;

	try {
		const payload = await Api.sendFieldsRequest(
			`/mobile/quest`,
			{
				quests: true,
				dailyQuests: true,
			},
			{ detach: true }
		);

		const newQuests: Quest[] = [];
		if (payload.quests) {
			newQuests.push(
				...storeModelList(Quest, payload.quests).filter((i: Quest) => {
					// We may get both daily quests and other quests when
					// requesting `quests`, but that may not include daily
					// quests that are in a completed state.
					//
					// Filter out any daily quests from here and insert the
					// result from the `dailyQuests` field instead.
					return !i.isDaily;
				})
			);
		}
		if (payload.dailyQuests) {
			// Insert the daily quests to the front of our new quests.
			newQuests.unshift(...storeModelList(Quest, payload.dailyQuests));
		}

		newQuestIdsForView.value = new Set(
			newQuests.filter(i => i.canAccept && i.is_new).map(i => i.id)
		);

		_assignQuests(newQuests);
		_clearUnknownQuestWatermarks(store);
	} catch (e) {
		console.error('Failed to load Quest sidebar data.', e);
	}
	isLoading.value = false;
	hasLoaded.value = true;
	return store;
}

export async function fetchDailyQuests(store: QuestStore) {
	const { _isLoadingDailyQuests, isLoading, allQuests } = store;
	if (_isLoadingDailyQuests.value) {
		return;
	}

	isLoading.value = true;
	_isLoadingDailyQuests.value = true;
	try {
		const payload = await Api.sendFieldsRequest(
			'/mobile/quest',
			{ dailyQuests: true },
			{
				detach: true,
			}
		);

		const newDailyQuests: Quest[] = payload.dailyQuests
			? storeModelList(Quest, payload.dailyQuests)
			: [];

		const oldNonDaily = allQuests.value.reduce<Quest[]>((result, i) => {
			if (!i.isDaily) {
				result.push(i);
			}
			return result;
		}, []);

		allQuests.value = [...newDailyQuests, ...oldNonDaily];
	} catch (e) {
		console.error('Error fetching daily quests.', e);
	}
	_isLoadingDailyQuests.value = false;
	isLoading.value = false;
	return store;
}

export function addNewQuestIds(store: QuestStore, ids: number[]) {
	const { _addQuestIds, newQuestIds, allQuests } = store;
	_addQuestIds(newQuestIds, ids);
	for (const quest of allQuests.value) {
		if (ids.includes(quest.id)) {
			quest.is_new = true;
		}
	}
}

export function addQuestActivityIds(store: QuestStore, ids: number[]) {
	const { _addQuestIds, questActivityIds, allQuests } = store;
	_addQuestIds(questActivityIds, ids);
	for (const quest of allQuests.value) {
		if (ids.includes(quest.id)) {
			quest.has_activity = true;
		}
	}
}

export function useQuestStore() {
	return inject(QuestStoreKey)!;
}
