<script lang="ts">
import { computed, toRefs } from 'vue';
import AppLoadingFade from '../../../_common/loading/AppLoadingFade.vue';
import AppQuestLogItem from '../../../_common/quest/AppQuestLogItem.vue';
import { Screen } from '../../../_common/screen/screen-service';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { useQuestStore } from '../../store/quest';
import AppQuestTimer from './AppQuestTimer.vue';
</script>

<script lang="ts" setup>
const props = defineProps({
	/**
	 * Prevents the quest items from being clicked when we determine them to be
	 * stale.
	 */
	disableOnExpiry: {
		type: Boolean,
	},
	/**
	 * Slices the list of quests to display only 1 row.
	 */
	singleRow: {
		type: Boolean,
	},
	activeQuestId: {
		type: Number,
		default: undefined,
	},
	forceLoading: {
		type: Boolean,
	},
});

const { disableOnExpiry, singleRow, forceLoading } = toRefs(props);

const {
	dailyQuests,
	fetchDailyQuests,
	isLoading: isQuestStoreLoading,
	isDailyStale,
	dailyResetDate,
} = useQuestStore();

const disableItems = computed(() => disableOnExpiry.value && isDailyStale.value);
const isLoading = computed(() => isQuestStoreLoading.value || forceLoading.value);
const hasQuests = computed(() => displayQuests.value.length > 0);

const displayQuests = computed(() => {
	const limit = singleRow.value ? 3 : undefined;
	return dailyQuests.value.slice(0, limit);
});

const showPlaceholders = computed(() => {
	if (isLoading.value) {
		return displayQuests.value.length === 0;
	}
	return false;
});

function onListClick() {
	if (!disableItems.value || isLoading.value) {
		return;
	}

	fetchDailyQuests();
}
</script>

<template>
	<AppLoadingFade v-if="showPlaceholders || hasQuests" :is-loading="isLoading">
		<div class="-header">
			<slot name="header">
				<h4 class="section-header" :class="{ h6: Screen.isXs }">
					<AppTranslate>Daily Quests</AppTranslate>
				</h4>
			</slot>

			<span class="help-inline">
				<AppQuestTimer v-if="dailyResetDate" :date="dailyResetDate" :ended="isDailyStale">
					<template #ended>
						<a class="link-unstyled" @click="fetchDailyQuests">
							<AppTranslate> Refresh </AppTranslate>
						</a>
					</template>
				</AppQuestTimer>
			</span>
		</div>

		<div class="-list">
			<div
				class="-list-grid"
				:class="{
					'-expired': disableItems,
				}"
				@click="onListClick"
			>
				<template v-if="showPlaceholders">
					<div v-for="i of 3" :key="'p-' + i" class="-placeholder-daily" />
				</template>
				<template v-else>
					<AppQuestLogItem
						v-for="(quest, i) of displayQuests"
						:key="i"
						:quest="quest"
						:active="activeQuestId === quest.id"
						:is-disabled="disableItems"
						compact-stack
					/>
				</template>
			</div>
		</div>
	</AppLoadingFade>
</template>

<style lang="stylus" scoped>
$-placeholder-height = 150px

.-header
	display: flex
	justify-content: space-between
	align-items: center
	margin-bottom: ($line-height-computed / 2)

	h4
		margin-bottom: 0

.-list-grid
	display: grid
	grid-gap: 16px
	grid-template-columns: repeat(3, minmax(0, 1fr))

.-expired
	opacity: 0.6

	&:hover
		cursor: pointer

.-placeholder-daily
	background-color: var(--theme-bg-subtle)
	rounded-corners-lg()
	display: flex
	height: $-placeholder-height
	flex: auto

.-no-quests
	min-height: $-placeholder-height
</style>
