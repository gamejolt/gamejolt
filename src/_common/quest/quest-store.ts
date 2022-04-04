import { provide, watch } from '@vue/runtime-core';
import { inject, InjectionKey, ref, Ref } from 'vue';
import { Api } from '../api/api.service';
import { User } from '../user/user.model';
import { Quest } from './quest-model';

export type QuestStore = ReturnType<typeof createQuestStore>;

const QuestStoreKey: InjectionKey<QuestStore> = Symbol('quest-store');

export function createQuestStore(user: Ref<User | null>) {
	const isLoading = ref(true);
	const hasLoaded = ref(false);

	watch(
		() => user.value,
		user => {
			if (!user) {
				_clearQuests();
				hasLoaded.value = false;
			}
		}
	);

	const quests = ref<Quest[]>([]);

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

	function addQuests(newQuests: Quest[], { overwrite: assign }: { overwrite?: boolean } = {}) {
		if (assign) {
			quests.value = newQuests;
		} else {
			quests.value.push(...newQuests);
		}
	}

	function _clearQuests() {
		addQuests([], { overwrite: true });
	}

	const c = {
		isLoading,
		hasLoaded,
		quests,
		fetchQuests,
		addQuests,
	};
	provide(QuestStoreKey, c);
	return c;
}

export function useQuestStore() {
	return inject(QuestStoreKey)!;
}
