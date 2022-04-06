import { provide, watch } from '@vue/runtime-core';
import { inject, InjectionKey, ref, Ref } from 'vue';
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
				isLoading.value = true;
				hasLoaded.value = false;
			}
		}
	);

	const quests = ref<Quest[]>([]);

	function addQuests(newQuests: Quest[], { overwrite: assign }: { overwrite?: boolean } = {}) {
		if (assign) {
			quests.value = newQuests;
		} else {
			quests.value.push(...newQuests);
		}
		hasLoaded.value = true;
	}

	function _clearQuests() {
		addQuests([], { overwrite: true });
		hasLoaded.value = false;
	}

	const c = {
		isLoading,
		hasLoaded,
		quests,
		addQuests,
	};
	provide(QuestStoreKey, c);
	return c;
}

export function useQuestStore() {
	return inject(QuestStoreKey)!;
}
