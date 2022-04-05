<script lang="ts" setup>
import { defineAsyncComponent, PropType, ref, toRefs } from 'vue';
import { Api } from '../api/api.service';
import AppButton from '../button/AppButton.vue';
import AppLoading from '../loading/loading.vue';
import { showModal } from '../modal/modal.service';
import { Quest } from './quest-model';
import { QuestObjectiveReward } from './quest-objective-reward-model';
import { QuestReward } from './quest-reward';

const props = defineProps({
	quest: {
		type: Object as PropType<Quest>,
		required: true,
	},
	show: { type: Boolean },
	isAccept: {
		type: Boolean,
	},
});

const { quest, show, isAccept } = toRefs(props);

const emit = defineEmits({
	newQuest: (_quest: Quest) => true,
});

const root = ref<HTMLElement>();
const isProcessingAction = ref(false);

async function onActionPressed() {
	if (isProcessingAction.value) {
		return;
	}

	isProcessingAction.value = true;
	let url: string;

	if (isAccept.value) {
		url = `/web/dash/quests/accept/${quest.value.id}`;
	} else {
		url = `/web/dash/quests/claim_all_rewards/${quest.value.id}`;
	}

	try {
		const payload = await Api.sendRequest(url, {});

		if (payload.quest) {
			emit('newQuest', new Quest(payload.quest));
		}

		if (!root.value) {
			return;
		}

		const objectiveRewards: QuestObjectiveReward[] = payload.rewards
			? QuestObjectiveReward.populate(payload.rewards)
			: [];

		const compactRewards = new Map<string, QuestReward>();

		const addOrUpdateReward = function (options: {
			key: string;
			img_url?: string;
			amount: number;
			name: string;
		}) {
			const { key, amount } = options;
			if (compactRewards.has(key)) {
				compactRewards.get(key)!.amount += amount;
			} else {
				compactRewards.set(key, new QuestReward(options));
			}
		};

		for (const reward of objectiveRewards) {
			/* if (reward.isExp) {
				// TODO(quests) experience rewards
				addOrUpdateReward({
					key: 'exp',
					amount: reward.fallback_amount,
					img_url: reward.fallback_media?.mediaserver_url,
					name: reward.name,
				});
			} else */ if (reward.isSticker) {
				for (const { amount, sticker } of reward.stickers) {
					addOrUpdateReward({
						key: `sticker-${sticker.id}`,
						amount,
						img_url: sticker.img_url,
						name: reward.name,
					});
				}
			} /* else if (reward.isTrophy) {
				// TODO(quests) trophy rewards
				addOrUpdateReward({
					key: `trophy-${reward.id}`,
					amount: reward.fallback_amount,
					img_url: reward.fallback_media?.mediaserver_url,
					name: reward.name,
				});
			} else {
				addOrUpdateReward({
					key: `${reward.name}-${reward.id}`,
					amount: reward.fallback_amount,
					img_url: reward.fallback_media?.mediaserver_url,
					name: reward.name,
				});
			} */
		}

		const rewards = [...compactRewards.values()];
		if (rewards.length === 0 && !isAccept.value) {
			return;
		}
		const title = isAccept.value ? quest.value.title : undefined;

		showModal({
			modalId: 'QuestRewards',
			component: defineAsyncComponent(() => import('./reward/AppQuestRewardModal.vue')),
			props: {
				quest: quest.value,
				title,
				rewards,
			},
			noBackdropClose: true,
			size: 'full',
		});
	} catch (e) {
		console.error(e);
	} finally {
		isProcessingAction.value = false;
	}
}
</script>

<template>
	<div ref="root">
		<AppButton v-if="show" primary outline block @click="onActionPressed">
			<AppLoading v-if="isProcessingAction" class="-loading" hide-label stationary centered />
			<AppTranslate v-else>
				{{ isAccept ? 'Accept quest' : 'Collect rewards' }}
			</AppTranslate>
		</AppButton>
	</div>
</template>

<style lang="stylus" scoped>
.-loading
	margin: 0
	padding: 0 2px 0 0
	height: 36px
</style>
