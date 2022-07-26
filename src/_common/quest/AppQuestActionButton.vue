<script lang="ts">
import { watch } from '@vue/runtime-core';
import { computed, defineAsyncComponent, PropType, ref, toRefs } from 'vue';
import { getMediaserverUrlForBounds } from '../../utils/image';
import { Api } from '../api/api.service';
import AppButton from '../button/AppButton.vue';
import { Jolticon } from '../jolticon/AppJolticon.vue';
import AppLoading from '../loading/AppLoading.vue';
import { showModal } from '../modal/modal.service';
import { Quest } from './quest-model';
import { QuestObjectiveReward } from './quest-objective-reward-model';
import { QuestReward } from './reward/AppQuestRewardModal.vue';
</script>

<script lang="ts" setup>
const props = defineProps({
	quest: {
		type: Object as PropType<Quest>,
		required: true,
	},
	show: {
		type: Boolean,
	},
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
const hasError = ref(false);

watch(quest, _ => {
	// Reset our error state if the quest was updated from something.
	hasError.value = false;
});

const shouldShow = computed(() => show.value && !hasError.value);

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
		const payload = await Api.sendRequest(
			url,
			{},
			{
				detach: true,
			}
		);

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

		const addOrUpdateReward = (options: QuestReward & { key: string }) => {
			const { key, amount } = options;
			if (compactRewards.has(key)) {
				compactRewards.get(key)!.amount += amount;
			} else {
				options.icon ??= 'gift';
				compactRewards.set(key, options);
			}
		};

		const processMediaserverUrl = (src: string | undefined) => {
			if (src) {
				return getMediaserverUrlForBounds({
					src,
					maxWidth: 100,
					maxHeight: 100,
				});
			}
		};
		const fallbackIcon: Jolticon = 'gift';

		for (const reward of objectiveRewards) {
			if (reward.isSticker) {
				for (const { amount, sticker } of reward.stickers) {
					addOrUpdateReward({
						key: `sticker-${sticker.id}`,
						amount,
						img_url: sticker.img_url,
						name: reward.name,
						icon: fallbackIcon,
					});
				}
			} else if (reward.isExp) {
				addOrUpdateReward({
					// Combine all exp rewards into 1 listing
					key: 'exp',
					amount: reward.fallback_amount,
					img_url: processMediaserverUrl(reward.fallback_media?.mediaserver_url),
					name: reward.name,
					icon: 'exp',
					isExp: true,
				});
			} else if (reward.isTrophy && !!reward.trophy) {
				const { id, img_thumbnail } = reward.trophy;
				addOrUpdateReward({
					key: `trophy-${id}`,
					amount: 1,
					img_url: img_thumbnail,
					name: reward.name,
					icon: 'trophy',
				});
			} else if (reward.isBackground && !!reward.background) {
				const { id } = reward.background;
				addOrUpdateReward({
					key: `background-${id}`,
					amount: 1,
					img_url: processMediaserverUrl(reward.background.media_item.mediaserver_url),
					name: reward.name,
					icon: 'paintbrush',
				});
			} else {
				addOrUpdateReward({
					key: `unknown-${reward.name}-${reward.id}`,
					amount: reward.fallback_amount,
					img_url: processMediaserverUrl(reward.fallback_media?.mediaserver_url),
					name: reward.name,
					icon: fallbackIcon,
				});
			}
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
		// Mark this component as having an error, hiding the action button from other inputs.
		hasError.value = true;
		console.error(e);
	} finally {
		isProcessingAction.value = false;
	}
}
</script>

<template>
	<div ref="root">
		<AppButton v-if="shouldShow" primary outline block @click="onActionPressed">
			<AppLoading v-if="isProcessingAction" class="-loading" hide-label stationary centered />
			<AppTranslate v-else>
				{{ isAccept ? 'Accept quest' : 'Claim rewards' }}
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
