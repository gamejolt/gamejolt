import { computed, inject, InjectionKey, ref, Ref, watch } from 'vue';
import { getCurrentServerTime } from '../../utils/server-time';
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

	const dailyResetDate = ref<number>();
	const isDailyStale = ref(false);

	const _allQuests = ref<Quest[]>([]);

	/** The UTC hour that we'll refresh quests at */
	let _questResetHour: number | undefined;
	let _dailyQuestExpiryTicker: number | undefined;

	const dailyQuests = computed(() =>
		_allQuests.value.filter(i => i.repeat_type === QuestRepeatType.daily)
	);
	const quests = computed(() =>
		_allQuests.value.filter(i => i.repeat_type !== QuestRepeatType.daily)
	);

	// Set up a window interval to check if our daily quests are stale or not.
	_setDailyTicker();

	// Reset this store when we lose our current user. If we have a new login,
	// set up our daily expiry interval again.
	watch(
		() => user.value,
		user => {
			if (user) {
				if (!_dailyQuestExpiryTicker) {
					_setDailyTicker();
				}
				return;
			}

			isDailyStale.value = false;
			if (_dailyQuestExpiryTicker) {
				window.clearInterval(_dailyQuestExpiryTicker);
			}

			addQuests([], { overwrite: true });
			clearNewQuestIds('all', { pushView: false });
			clearQuestActivityIds('all', { pushView: false });
			isLoading.value = true;
			hasLoaded.value = false;
			_isLoadingDailyQuests.value = false;
		}
	);

	watch(
		() => isDailyStale.value,
		isStale => {
			if (isStale) {
				addNewQuestIds([-1]);
			} else {
				clearNewQuestIds([-1], { pushView: false });
			}
		}
	);

	function _setDailyTicker() {
		if (import.meta.env.SSR || _dailyQuestExpiryTicker) {
			return;
		}

		_dailyQuestExpiryTicker = window.setInterval(() => {
			const expiry = dailyResetDate.value;
			if (!expiry || isDailyStale.value) {
				return;
			}

			if (expiry - 1000 > getCurrentServerTime()) {
				return;
			}

			isDailyStale.value = true;
		}, 1000);
	}

	async function fetchDailyQuests() {
		if (_isLoadingDailyQuests.value) {
			return;
		}

		isLoading.value = true;
		_isLoadingDailyQuests.value = true;
		try {
			const payload = await Api.sendRequest(
				'/mobile/quest',
				{
					_fields: {
						dailyQuests: true,
					},
				},
				{
					sanitizeComplexData: false,
					detach: true,
				}
			);

			const newDailyQuests: Quest[] = payload.dailyQuests
				? Quest.populate(payload.dailyQuests)
				: [];

			const oldNonDaily = quests.value;
			_allQuests.value = [...newDailyQuests, ...oldNonDaily];
			_checkDailyQuestExpiry();
		} finally {
			_isLoadingDailyQuests.value = false;
			isLoading.value = false;
		}
	}

	// TODO(quests) check this works
	function _checkDailyQuestExpiry() {
		const data = dailyQuests.value.find(i => !!i.ends_on);
		if (!data || !data.ends_on) {
			isDailyStale.value = true;
			return;
		}

		if (_questResetHour === undefined) {
			const hour = new Date(data.ends_on).getUTCHours();
			setDailyResetHour(hour);
			getCurrentServerTime;
		}

		const endsOn = dailyResetDate.value ?? getCurrentServerTime();
		if (data.ends_on > endsOn) {
			isDailyStale.value = false;
		}
	}

	function addQuests(newQuests: Quest[], { overwrite }: { overwrite?: boolean } = {}) {
		if (overwrite) {
			_allQuests.value = newQuests;
		} else {
			_allQuests.value.push(...newQuests);
		}

		_checkDailyQuestExpiry();
		hasLoaded.value = true;
	}

	function updateQuest(data: Quest) {
		_allQuests.value.find(i => i.id === data.id)?.assign(data);
	}

	function setDailyResetHour(newHour: number) {
		const prev = _questResetHour;
		_questResetHour = newHour;

		const utcExpiry = new Date();
		const utcNowHours = utcExpiry.getUTCHours();
		// Immediately set our daily quests as expired if we get a new quest
		// reset hour that's before our current time.
		if (prev && utcNowHours < prev && newHour < utcNowHours) {
			isDailyStale.value = true;
		}

		let additionalDays = 0;
		// Set the expiry date to tomorrow if we're already past the hour.
		if (newHour < utcNowHours) {
			++additionalDays;
		}
		utcExpiry.setUTCDate(utcExpiry.getUTCDate() + additionalDays);

		const hours = Math.floor(newHour);
		const min = (newHour % 1) * 60;
		const sec = (min % 1) * 60;
		const ms = (sec % 1) * 1000;
		utcExpiry.setUTCHours(hours, min, sec, ms);

		dailyResetDate.value = utcExpiry.getTime();
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
		/** Only quests that are {@link QuestRepeatType.daily} */
		dailyQuests,
		/** All quests, other than {@link QuestRepeatType.daily} */
		quests,
		allQuests: computed(() => _allQuests.value),
		addQuests,
		fetchDailyQuests,
		/**
		 * Finds any existing quest with a matching id and assigns new data to
		 * it.
		 */
		updateQuest,
		setDailyResetHour,
		dailyResetDate,
		isDailyStale,
		addNewQuestIds,
		addQuestActivityIds,
		clearNewQuestIds,
		clearQuestActivityIds,
		newQuestIds,
		questActivityIds,
	};
	return c;
}

export function useQuestStore() {
	return inject(QuestStoreKey)!;
}
