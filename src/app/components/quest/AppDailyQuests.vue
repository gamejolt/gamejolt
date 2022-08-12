<script lang="ts">
import { computed, toRefs } from 'vue';
import AppLoadingFade from '../../../_common/loading/AppLoadingFade.vue';
import AppQuestLogItem from '../../../_common/quest/AppQuestLogItem.vue';
import { Screen } from '../../../_common/screen/screen-service';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { illChargeOrbEmpty } from '../../img/ill/illustrations';
import { useQuestStore } from '../../store/quest';
import AppQuestTimer from './AppQuestTimer.vue';
</script>

<script lang="ts" setup>
import AppAnimChargeOrb from '../../../_common/animation/AppAnimChargeOrb.vue';
import AppAnimElectricity from '../../../_common/animation/AppAnimElectricity.vue';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import { StickerChargeModal } from '../../../_common/sticker/charge/modal/modal.service';
import { useStickerStore } from '../../../_common/sticker/sticker-store';
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

const { disableOnExpiry, singleRow, activeQuestId, forceLoading } = toRefs(props);

const {
	dailyQuests,
	fetchDailyQuests,
	isLoading: isQuestStoreLoading,
	isDailyStale,
	dailyResetDate,
} = useQuestStore();

const { currentCharge, chargeLimit } = useStickerStore();

const disableItems = computed(() => disableOnExpiry.value && isDailyStale.value);
const isLoading = computed(() => isQuestStoreLoading.value || forceLoading.value);
const hasQuests = computed(() => displayQuests.value.length > 0);

const displayCharge = computed(() => {
	const current = Math.min(currentCharge.value, chargeLimit.value);

	return `${current}/${chargeLimit.value}`;
});

const chargeOrbStyle = computed(() => {
	if (!currentCharge.value) {
		return 'empty';
	} else if (currentCharge.value < chargeLimit.value) {
		return 'partial';
	} else {
		return 'overcharge';
	}
});

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

function onClickCharge() {
	StickerChargeModal.show();
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

			<span class="help-inline -info">
				<span
					class="-charge-orb-container"
					:class="{
						'-overcharge': chargeOrbStyle === 'overcharge',
					}"
					:style="{ marginRight: dailyResetDate ? '12px' : undefined }"
					@click="onClickCharge"
				>
					<div class="-charge-orb">
						<AppIllustration
							v-if="chargeOrbStyle === 'empty'"
							class="-charge-orb-img"
							:asset="illChargeOrbEmpty"
							:style="{
								opacity: 0.3,
							}"
						/>
						<AppAnimElectricity
							v-else
							shock-anim="square"
							:disabled="chargeOrbStyle !== 'overcharge'"
						>
							<AppAnimChargeOrb />
						</AppAnimElectricity>
					</div>

					<span>
						{{ ' ' + displayCharge }}
					</span>
				</span>

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

.-info
	white-space: nowrap

.-charge-orb-container
	cursor: pointer

	&.-overcharge
		color: var(--theme-fg)

.-charge-orb
	flex: none
	width: $font-size-small
	height: @width
	position: relative
	display: inline-block

.-charge-orb-img
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
</style>
