import { provide, watch } from '@vue/runtime-core';
import { inject, InjectionKey, ref, Ref, shallowRef } from 'vue';
import { Api } from '../api/api.service';
import { User } from '../user/user.model';
import { Quest, QuestRepeatType } from './quest-model';

export type QuestStore = ReturnType<typeof createQuestStore>;

const QuestStoreKey: InjectionKey<QuestStore> = Symbol('quest-store');

export function createQuestStore(user: Ref<User | null>) {
	const isLoading = ref(true);
	const hasLoaded = ref(false);

	watch(
		() => user.value,
		user => {
			if (!user) {
				clearQuests();
				hasLoaded.value = false;
			}
		}
	);

	const dailyQuests = shallowRef<Quest[]>([]);
	const activeQuests = shallowRef<Quest[]>([]);
	const completedQuests = shallowRef<Quest[]>([]);
	// TODO(quests) check what types of quests we want to display and how we
	// want to display them.
	const miscQuests = shallowRef<Quest[]>([]);

	// TODO(quests) daily, active, expired quests
	async function fetchQuests(
		options: { daily?: boolean; active?: boolean; completed?: boolean } = {}
	) {
		isLoading.value = true;
		try {
			const payload = await Api.sendRequest(
				'/mobile/quest',
				{
					_fields: {
						quests: true,
					},
				},
				{
					sanitizeComplexData: false,
				}
			);
			addQuests(Quest.populate(payload['quests']), { overwrite: true });
			hasLoaded.value = true;
		} finally {
			isLoading.value = false;
		}
	}

	function addQuests(quests: Quest[], { overwrite: assign }: { overwrite?: boolean } = {}) {
		const newDaily: Quest[] = [];
		const newActive: Quest[] = [];
		const newCompleted: Quest[] = [];
		const newMisc: Quest[] = [];

		for (const quest of quests) {
			if (quest.repeat_type === QuestRepeatType.daily) {
				newDaily.push(quest);
			} else if (quest.isActive) {
				newActive.push(quest);
			} else if (quest.isComplete) {
				newCompleted.push(quest);
			} else {
				newMisc.push(quest);
			}
		}

		if (assign) {
			dailyQuests.value = newDaily;
			activeQuests.value = newActive;
			completedQuests.value = newCompleted;
			miscQuests.value = newMisc;
		} else {
			dailyQuests.value.push(...newDaily);
			activeQuests.value.push(...newActive);
			completedQuests.value.push(...newCompleted);
			miscQuests.value.push(...newMisc);
		}
	}

	function clearQuests() {
		addQuests([], { overwrite: true });
	}

	const c = {
		isLoading,
		hasLoaded,
		dailyQuests,
		activeQuests,
		completedQuests,
		fetchQuests,
		addQuests,
		// clearQuests,
	};
	provide(QuestStoreKey, c);
	return c;
}

export function useQuestStore() {
	return inject(QuestStoreKey)!;
}
