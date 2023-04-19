import { computed, inject, InjectionKey, ref, Ref, watch } from 'vue';
import { Api } from '../../_common/api/api.service';
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
	const isLoading = ref(true);
	const hasLoaded = ref(false);
	const _isLoadingDailyQuests = ref(false);

	const newQuestIds = ref<QuestIdSet>(new Set());
	const questActivityIds = ref<QuestIdSet>(new Set());

	const _allQuests = ref<Quest[]>([]);

	const dailyQuests = computed(() =>
		_allQuests.value.filter(i => i.repeat_type === QuestRepeatType.daily)
	);
	const quests = computed(() =>
		_allQuests.value.filter(i => i.repeat_type !== QuestRepeatType.daily)
	);

	// Reset this store when we lose our current user.
	watch(
		() => user.value,
		user => {
			if (user) {
				return;
			}

			assignQuests([]);
			clearNewQuestIds('all', { pushView: false });
			clearQuestActivityIds('all', { pushView: false });
			isLoading.value = true;
			hasLoaded.value = false;
			_isLoadingDailyQuests.value = false;
		}
	);

	async function fetchDailyQuests() {
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
				? Quest.populate(payload.dailyQuests)
				: [];

			const oldNonDaily = quests.value;
			_allQuests.value = [...newDailyQuests, ...oldNonDaily];
		} finally {
			_isLoadingDailyQuests.value = false;
			isLoading.value = false;
		}
	}

	function assignQuests(newQuests: Quest[]) {
		_allQuests.value = newQuests;
		hasLoaded.value = true;
	}

	function updateQuest(data: Quest) {
		_allQuests.value.find(i => i.id === data.id)?.assign(data);
	}

	function addNewQuestIds(ids: number[]) {
		_addQuestIds(newQuestIds, ids);
		for (const quest of _allQuests.value) {
			if (ids.includes(quest.id)) {
				quest.is_new = true;
			}
		}
	}

	function addQuestActivityIds(ids: number[]) {
		_addQuestIds(questActivityIds, ids);
		for (const quest of _allQuests.value) {
			if (ids.includes(quest.id)) {
				quest.has_activity = true;
			}
		}
	}

	function clearNewQuestIds(ids: number[] | 'all', { pushView }: { pushView: boolean }) {
		_clearQuestIds(newQuestIds, ids, { type: 'new-quest', pushView });
	}

	function clearQuestActivityIds(ids: number[] | 'all', { pushView }: { pushView: boolean }) {
		_clearQuestIds(questActivityIds, ids, { type: 'quest-activity', pushView });
	}

	function _addQuestIds(list: Ref<QuestIdSet>, ids: number[]) {
		for (const id of ids) {
			list.value.add(id);
		}
	}

	function _clearQuestIds(
		list: Ref<QuestIdSet>,
		ids: number[] | 'all',
		{ type, pushView }: { type: 'new-quest' | 'quest-activity'; pushView: boolean }
	) {
		const clearIds = ids === 'all' ? list.value.values() : ids;

		for (const questId of clearIds) {
			list.value.delete(questId);
			if (pushView) {
				grid.value?.pushViewNotifications(type, {
					questId,
				});
			}
		}
	}

	const c = {
		isLoading,
		hasLoaded,
		/** Only quests that are {@link QuestRepeatType.daily}. */
		dailyQuests,
		/** All quests, other than {@link QuestRepeatType.daily}. */
		quests,
		allQuests: computed(() => _allQuests.value),
		/** Overwrites our existing {@link _allQuests} and marks this as bootstrapped. */
		assignQuests,
		fetchDailyQuests,
		/**
		 * Finds any existing quest with a matching id and assigns new data to
		 * it.
		 */
		updateQuest,
		newQuestIds,
		questActivityIds,
		addNewQuestIds,
		addQuestActivityIds,
		clearNewQuestIds,
		clearQuestActivityIds,
	};
	return c;
}

export function useQuestStore() {
	return inject(QuestStoreKey)!;
}
