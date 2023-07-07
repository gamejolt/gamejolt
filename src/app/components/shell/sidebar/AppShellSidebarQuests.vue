<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useEscapeStack } from '../../../../_common/escape-stack/escape-stack.service';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { illNoComments, illNoCommentsSmall } from '../../../../_common/illustration/illustrations';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { Quest, QuestRepeatType, QuestSeries } from '../../../../_common/quest/quest-model';
import { Screen } from '../../../../_common/screen/screen-service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { numberSort } from '../../../../utils/array';
import { run } from '../../../../utils/utils';
import { useAppStore } from '../../../store/index';
import { fetchAllQuests, useQuestStore } from '../../../store/quest';
import AppDailyQuests from '../../quest/AppDailyQuests.vue';
import AppQuestLogItem from './_quests/AppQuestLogItem.vue';

const questChunkSorting = {
	'Daily Quests': 0,
	'Intro Quests': 1,
	'New Quests': 2,
	'Weekly Quests': 3,
	'Active Quests': 4,
	'Available Quests': 5,
	'Expired Quests': 6,
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

const { toggleLeftPane } = useAppStore();
const questStore = useQuestStore();
const {
	isLoading,
	hasLoaded,
	dailyQuests,
	allQuests,
	newQuestIdsForView,
	activeQuest,
	activeQuestId,
} = questStore;

useEscapeStack(() => {
	// Closes any open quest window.
	activeQuest.value = undefined;
	toggleLeftPane('');
});

const questChunks = computed(() => {
	const items = allQuests.value
		.filter(i => i.repeat_type !== QuestRepeatType.daily)
		.reduce((chunks, quest) => {
			const [type, label] = run<[keyof typeof questChunkSorting, string]>(() => {
				if (quest.canAccept) {
					if (newQuestIdsForView.value.has(quest.id)) {
						return ['New Quests', $gettext('New Quests')];
					}
					return ['Available Quests', $gettext('Available Quests')];
				}

				if (quest.isExpired) {
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

const hasQuests = computed(() => {
	if (dailyQuests.value.length) {
		return true;
	}

	for (const chunk of questChunks.value) {
		if (chunk.quests.length > 0) {
			return true;
		}
	}
	return false;
});

onMounted(async () => {
	await fetchAllQuests(questStore);
});
</script>

<template>
	<div id="shell-sidebar-quests" class="_sidebar fill-offset">
		<div class="_quest-list">
			<AppLoadingFade :is-loading="isLoading">
				<div class="_sections">
					<AppDailyQuests
						v-if="!hasLoaded || dailyQuests.length > 0"
						:active-quest-id="activeQuestId"
						show-charge
						:direction="Screen.isXs ? 'column' : 'row'"
						:constrain-charge-tooltip="true"
						:grid-styles="{
							marginLeft: `-8px`,
							marginRight: `-8px`,
						}"
					>
						<template #header>
							<div class="_subheading">
								{{ $gettext(`Daily Quests`) }}
							</div>
						</template>
					</AppDailyQuests>

					<template v-if="!hasLoaded">
						<!-- Active Quests -->
						<div>
							<div class="_placeholder _placeholder-subheading" />

							<AppSpacer vertical :scale="2" />

							<div class="_col">
								<div class="_placeholder _placeholder-tile" />
							</div>
						</div>
					</template>
					<template v-else-if="!hasQuests">
						<div class="_empty">
							<AppIllustration
								:asset="Screen.isXs ? illNoCommentsSmall : illNoComments"
							>
								{{ $gettext(`You have no active quests`) }}
							</AppIllustration>
						</div>
					</template>
					<template v-else-if="questChunks.length > 0">
						<!-- Active Quests -->
						<div v-for="{ type, quests } in questChunks" :key="type">
							<div class="_subheading">
								{{ type }}
							</div>

							<AppSpacer vertical :scale="2" />

							<div class="_col">
								<AppQuestLogItem
									v-for="quest of quests"
									:key="quest.id"
									:quest="quest"
									:active="activeQuestId === quest.id"
								/>
							</div>
						</div>
					</template>
				</div>
			</AppLoadingFade>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-font-size-subheading = $font-size-large

#shell-sidebar-quests
	--base-pad: 16px
	--half-pad: calc(var(--base-pad) * 0.5)
	padding: var(--base-pad)

._sidebar
	flex: 1 1

._quest-list
	position: relative
	height: 100%
	flex: auto
	display: flex
	flex-direction: column
	height: fit-content

._empty
	display: flex
	flex-direction: column
	justify-content: center
	min-height: calc(70vh - var(--shell-top) - 40px)

._sections
	display: flex
	flex-direction: column
	grid-gap: 40px

._subheading
	margin-top: 0
	font-family: $font-family-display
	font-weight: 800
	font-size: $-font-size-subheading

._placeholder
	background-color: var(--theme-bg-subtle)
	rounded-corners-lg()

._placeholder-subheading
	width: 120px
	height: floor($-font-size-subheading * $line-height-base)

._col
	display: flex
	flex-direction: column
	gap: 8px 16px

._placeholder-tile
	width: 100%
	height: 120px
</style>
