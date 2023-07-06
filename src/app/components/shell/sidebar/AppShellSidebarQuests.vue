<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { illNoComments, illNoCommentsSmall } from '../../../../_common/illustration/illustrations';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { storeModelList } from '../../../../_common/model/model-store.service';
import { Quest } from '../../../../_common/quest/quest-model';
import { Screen } from '../../../../_common/screen/screen-service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { useQuestStore } from '../../../store/quest';
import AppDailyQuests from '../../quest/AppDailyQuests.vue';
import AppQuestLogItem from './_quests/AppQuestLogItem.vue';

const {
	isLoading,
	hasLoaded,
	assignQuests,
	dailyQuests,
	questChunks,
	allQuests,
	newQuestIds,
	newQuestIdsForView,
	questActivityIds,
	clearNewQuestIds,
	clearQuestActivityIds,
	activeQuest,
} = useQuestStore();

const activeQuestId = computed(() =>
	typeof activeQuest.value === 'number' ? activeQuest.value : activeQuest.value?.id
);

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

async function init() {
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

		assignQuests(newQuests);
		clearUnknownWatermarks();
	} catch (e) {
		console.error('Failed to load Quest sidebar data.', e);
	}
	isLoading.value = false;
	hasLoaded.value = true;
}

onMounted(async () => {
	await init();
});

function clearUnknownWatermarks() {
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
