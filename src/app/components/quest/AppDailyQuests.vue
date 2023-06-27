<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue';
import AppAnimChargeOrb from '../../../_common/animation/AppAnimChargeOrb.vue';
import AppAnimElectricity from '../../../_common/animation/AppAnimElectricity.vue';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import AppLoadingFade from '../../../_common/loading/AppLoadingFade.vue';
import AppQuestLogItem from '../../../_common/quest/AppQuestLogItem.vue';
import { Screen } from '../../../_common/screen/screen-service';
import AppStickerChargeTooltip from '../../../_common/sticker/charge/AppStickerChargeTooltip.vue';
import AppStickerChargeTooltipCaret from '../../../_common/sticker/charge/AppStickerChargeTooltipCaret.vue';
import AppStickerChargeTooltipHandler from '../../../_common/sticker/charge/AppStickerChargeTooltipHandler.vue';
import { useStickerStore } from '../../../_common/sticker/sticker-store';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { illChargeOrbEmpty } from '../../../_common/illustration/illustrations';
import { useQuestStore } from '../../store/quest';
import { useGridStore } from '../grid/grid-store';
import AppQuestTimer from './AppQuestTimer.vue';

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
	/**
	 * Shows a charge orb with our current and max values. Content shows a
	 * tooltip explaining charge on hover/focus, depending on pointer type.
	 */
	showCharge: {
		type: Boolean,
	},
	/**
	 *
	 */
	constrainChargeTooltip: {
		type: Boolean,
	},
});

const { singleRow, activeQuestId, forceLoading, showCharge, constrainChargeTooltip } =
	toRefs(props);

// Mark as loading until Grid is fully bootstrapped.
const { grid } = useGridStore();
const isLoadingCharge = ref(grid.value?.bootstrapReceived !== true);
if (isLoadingCharge.value) {
	watch(
		() => grid.value?.bootstrapReceived,
		bootstrapped => {
			if (bootstrapped) {
				isLoadingCharge.value = false;
			}
		}
	);
}

const { dailyQuests, fetchDailyQuests, isLoading: isQuestStoreLoading } = useQuestStore();

const { currentCharge, chargeLimit } = useStickerStore();

const chargeOrb = ref<HTMLElement>();
const header = ref<HTMLElement>();

const showChargeTooltip = ref(false);

const isLoading = computed(() => isQuestStoreLoading.value || forceLoading.value);
const hasQuests = computed(() => displayQuests.value.length > 0);

const displayCharge = computed(() => {
	if (isLoadingCharge.value) {
		return $gettext(`loading...`);
	}

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

const questEndsOnDate = computed(() => {
	let soonestExpiry: number | null = null;

	for (const quest of dailyQuests.value) {
		if (!quest.ends_on) {
			continue;
		}

		if (!soonestExpiry) {
			soonestExpiry = quest.ends_on;
		} else if (quest.ends_on < soonestExpiry) {
			soonestExpiry = quest.ends_on;
		}
	}

	return soonestExpiry;
});

const showPlaceholders = computed(() => {
	if (isLoading.value) {
		return displayQuests.value.length === 0;
	}
	return false;
});
</script>

<template>
	<AppLoadingFade v-if="showPlaceholders || hasQuests" :is-loading="isLoading">
		<div ref="header" class="-header">
			<slot name="header">
				<h4 class="section-header" :class="{ h6: Screen.isXs }">
					<AppTranslate>Daily Quests</AppTranslate>
				</h4>
			</slot>

			<span class="help-inline -info">
				<template v-if="showCharge">
					<AppStickerChargeTooltipHandler
						class="-charge-orb-container"
						:class="{
							'-overcharge': chargeOrbStyle === 'overcharge',
						}"
						:style="{ marginRight: questEndsOnDate ? '12px' : undefined }"
						:trigger="Screen.isPointerMouse ? 'hover' : 'focus'"
						inline
						@show="showChargeTooltip = true"
						@hide="showChargeTooltip = false"
					>
						<AppStickerChargeTooltipCaret
							class="-charge-caret"
							:show="showChargeTooltip"
							inline
						>
							<div ref="chargeOrb" class="-charge-orb">
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
						</AppStickerChargeTooltipCaret>

						<span>
							{{ ' ' + displayCharge }}
						</span>
					</AppStickerChargeTooltipHandler>

					<AppStickerChargeTooltip
						v-if="chargeOrb"
						:show="showChargeTooltip"
						:caret-element="chargeOrb"
						:width-tracker-element="constrainChargeTooltip ? header : undefined"
					/>
				</template>

				<AppQuestTimer v-if="questEndsOnDate" :ends-on="questEndsOnDate">
					<template #ended>
						<a class="link-unstyled" @click="fetchDailyQuests">
							<AppTranslate> Refresh </AppTranslate>
						</a>
					</template>
				</AppQuestTimer>
			</span>
		</div>

		<div class="-list">
			<div class="-list-grid">
				<template v-if="showPlaceholders">
					<div v-for="i of 3" :key="'p-' + i" class="-placeholder-daily" />
				</template>
				<template v-else>
					<AppQuestLogItem
						v-for="(quest, i) of displayQuests"
						:key="i"
						:quest="quest"
						:active="activeQuestId === quest.id"
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

.-placeholder-daily
	background-color: var(--theme-bg-subtle)
	rounded-corners-lg()
	display: flex
	height: $-placeholder-height
	flex: auto

.-no-quests
	min-height: $-placeholder-height

.-info
	position: relative
	white-space: nowrap

.-charge-caret
	display: inline-flex

.-charge-orb-container
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
