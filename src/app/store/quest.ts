import { computed, inject, InjectionKey, ref, Ref, watch } from 'vue';
import { Api } from '../../_common/api/api.service';
import { storeModelList } from '../../_common/model/model-store.service';
import { Quest, QuestRepeatType, QuestSeries } from '../../_common/quest/quest-model';
import { $gettext } from '../../_common/translate/translate.service';
import { User } from '../../_common/user/user.model';
import { numberSort } from '../../utils/array';
import { run } from '../../utils/utils';
import { GridClient } from '../components/grid/client.service';

export type QuestStore = ReturnType<typeof createQuestStore>;
type QuestIdSet = Set<number>;

export const QuestStoreKey: InjectionKey<QuestStore> = Symbol('quest-store');

const questChunkSorting = {
	'Daily Quests': 0,
	'Intro Quests': 1,
	'Weekly Quests': 2,
	'Active Quests': 3,
	'Available Quests': 4,
	'Expired Quests': 5,
} as const;

interface QuestChunk {
	/**
	 * Used to sort quest chunks.
	 */
	type: keyof typeof questChunkSorting;

	/**
	 * Translated label for the chunk.
	 */
	label: string;
	quests: Quest[];
}

export function createQuestStore({
	user,
	grid,
}: {
	user: Ref<User | null>;
	grid: Ref<GridClient | undefined>;
}) {
	const isLoading = ref(false);
	const hasLoaded = ref(false);
	const _isLoadingDailyQuests = ref(false);

	const newQuestIds = ref<QuestIdSet>(new Set());
	const questActivityIds = ref<QuestIdSet>(new Set());

	const _allQuests = ref<Quest[]>([]);

	const dailyQuests = computed(() =>
		_allQuests.value.filter(i => i.repeat_type === QuestRepeatType.daily)
	);

	const questChunks = computed(() => {
		const items = _allQuests.value
			.filter(i => i.repeat_type !== QuestRepeatType.daily)
			.reduce((chunks, quest) => {
				const [type, label] = run<[keyof typeof questChunkSorting, string]>(() => {
					if (quest.canAccept) {
						return ['Available Quests', $gettext('Available Quests')];
					} else if (quest.isExpired) {
						return ['Expired Quests', $gettext('Expired Quests')];
					}

					switch (quest.series) {
						// We filter these out. This is just for safer typing.
						case QuestSeries.dailyQuest:
							return ['Daily Quests', $gettext('Daily Quests')];

						case QuestSeries.helloWorld:
							return ['Intro Quests', $gettext('Intro Quests')];

						case QuestSeries.weeklyQuest:
							return ['Weekly Quests', $gettext('Weekly Quests')];

						case QuestSeries.worldEvent:
						default:
							return ['Active Quests', $gettext('Active Quests')];
					}
				});

				const chunk = chunks.find(i => i.type === type);
				if (chunk) {
					chunk.quests.push(quest);
				} else {
					chunks.push({
						type,
						label,
						quests: [quest],
					});
				}
				return chunks;
			}, [] as QuestChunk[]);

		items.sort((a, b) => numberSort(questChunkSorting[a.type], questChunkSorting[b.type]));

		for (const chunk of items) {
			chunk.quests.sort((a, b) => numberSort(a.started_on, b.started_on));
		}
		return items;
	});

	/**
	 * The quest or quest ID that should be showing in the quest window.
	 */
	const activeQuest = ref(null) as Ref<number | Quest | null>;

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
				? storeModelList(Quest, payload.dailyQuests)
				: [];

			const oldNonDaily = questChunks.value.map(i => i.quests).flat();
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
		questChunks,
		allQuests: computed(() => _allQuests.value),
		activeQuest,
		/** Overwrites our existing {@link _allQuests} and marks this as bootstrapped. */
		assignQuests,
		fetchDailyQuests,
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
