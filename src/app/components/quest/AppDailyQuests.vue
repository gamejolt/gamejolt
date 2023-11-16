<script lang="ts" setup>
import { CSSProperties, PropType, computed, ref, toRefs, watch } from 'vue';
import AppAnimChargeOrb from '../../../_common/animation/AppAnimChargeOrb.vue';
import AppAnimElectricity from '../../../_common/animation/AppAnimElectricity.vue';
import { illChargeOrbEmpty } from '../../../_common/animation/slideshow/sheets';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import AppLoadingFade from '../../../_common/loading/AppLoadingFade.vue';
import { Screen } from '../../../_common/screen/screen-service';
import AppStickerChargeTooltip from '../../../_common/sticker/charge/AppStickerChargeTooltip.vue';
import AppStickerChargeTooltipCaret from '../../../_common/sticker/charge/AppStickerChargeTooltipCaret.vue';
import AppStickerChargeTooltipHandler from '../../../_common/sticker/charge/AppStickerChargeTooltipHandler.vue';
import { useStickerStore } from '../../../_common/sticker/sticker-store';
import { kThemeFg } from '../../../_common/theme/variables';
import { $gettext } from '../../../_common/translate/translate.service';
import { styleWhen } from '../../../_styles/mixins';
import { fetchDailyQuests, useQuestStore } from '../../store/quest';
import { useGridStore } from '../grid/grid-store';
import AppQuestLogItem from '../shell/sidebar/_quests/AppQuestLogItem.vue';
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
	direction: {
		type: String as PropType<'row' | 'column'>,
		default: `row`,
		validator: val => typeof val === 'string' && ['row', 'column'].includes(val),
	},
	gridStyles: {
		type: Object as PropType<CSSProperties>,
		default: () => ({}),
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

const questStore = useQuestStore();
const { dailyQuests, isLoading: isQuestStoreLoading } = questStore;

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

function onRefresh() {
	fetchDailyQuests(questStore);
}
</script>

<template>
	<AppLoadingFade v-if="showPlaceholders || hasQuests" :is-loading="isLoading">
		<div ref="header" class="_header">
			<slot name="header">
				<h4 class="section-header" :class="{ h6: Screen.isXs }">
					{{ $gettext(`Daily Quests`) }}
				</h4>
			</slot>

			<span class="_info help-inline">
				<template v-if="showCharge">
					<AppStickerChargeTooltipHandler
						:style="[
							styleWhen(!!questEndsOnDate, {
								marginRight: '12px',
							}),
							styleWhen(chargeOrbStyle === 'overcharge', {
								color: kThemeFg,
							}),
						]"
						:trigger="Screen.isPointerMouse ? 'hover' : 'focus'"
						inline
						@show="showChargeTooltip = true"
						@hide="showChargeTooltip = false"
					>
						<AppStickerChargeTooltipCaret
							class="_charge-caret"
							:show="showChargeTooltip"
							inline
						>
							<div ref="chargeOrb" class="_charge-orb">
								<AppIllustration
									v-if="chargeOrbStyle === 'empty'"
									class="_charge-orb-img"
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
						<a class="link-unstyled" @click="onRefresh">
							{{ $gettext(`Refresh`) }}
						</a>
					</template>
				</AppQuestTimer>
			</span>
		</div>

		<div
			class="_list-grid"
			:style="[
				styleWhen(direction === 'column', {
					gridTemplateColumns: '1fr',
				}),
				gridStyles,
			]"
		>
			<template v-if="showPlaceholders">
				<div v-for="i of 3" :key="`p-${i}`" class="_placeholder-daily" />
			</template>
			<template v-else>
				<AppQuestLogItem
					v-for="quest of displayQuests"
					:key="quest.id"
					:quest="quest"
					:active="activeQuestId === quest.id"
					:compact-stack="direction === 'row'"
				/>
			</template>
		</div>
	</AppLoadingFade>
</template>

<style lang="stylus" scoped>
$-placeholder-height = 150px

._header
	display: flex
	justify-content: space-between
	align-items: center
	margin-bottom: ($line-height-computed / 2)

	h4
		margin-bottom: 0

._list-grid
	display: grid
	grid-gap: 8px
	grid-template-columns: repeat(3, minmax(0, 1fr))

._placeholder-daily
	background-color: var(--theme-bg-subtle)
	rounded-corners-lg()
	display: flex
	height: $-placeholder-height
	flex: auto

._info
	position: relative
	white-space: nowrap

._charge-caret
	display: inline-flex

._charge-orb
	flex: none
	width: $font-size-small
	height: @width
	position: relative
	display: inline-block

._charge-orb-img
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
</style>
