<script lang="ts" setup>
import { CSSProperties, PropType, Ref, computed, nextTick, onUnmounted, ref, toRefs } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { illExtremeSadness } from '../../../../_common/illustration/illustrations';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { storeModel } from '../../../../_common/model/model-store.service';
import AppQuestActionButton from '../../../../_common/quest/AppQuestActionButton.vue';
import AppQuestObjective from '../../../../_common/quest/AppQuestObjective.vue';
import AppProgressBarQuest from '../../../../_common/quest/AppQuestProgress.vue';
import { Quest } from '../../../../_common/quest/quest-model';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { kThemeBgActual, kThemeFgMuted } from '../../../../_common/theme/variables';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { styleFlexCenter, styleWhen } from '../../../../_styles/mixins';
import {
	buildCSSPixelValue,
	kFontFamilyDisplay,
	kFontSizeSmall,
	kFontSizeTiny,
	kWeakEaseOut,
} from '../../../../_styles/variables';
import { numberSort } from '../../../../utils/array';
import { useAppStore } from '../../../store/index';
import { useQuestStore } from '../../../store/quest';
import AppShellWindow from '../../shell/window/AppShellWindow.vue';
import AppQuestTimer from '../AppQuestTimer.vue';

const props = defineProps({
	questId: {
		type: Number,
		required: true,
	},
	resource: {
		type: Object as PropType<Quest>,
		default: undefined,
	},
});

const { questId, resource } = toRefs(props);

const { toggleLeftPane } = useAppStore();
const { clearNewQuestIds, clearQuestActivityIds, activeQuest, activeQuestId } = useQuestStore();

const isLoading = ref(false);
const hasError = ref(false);
const hasActionButtonError = ref(false);

const localQuest = ref() as Ref<Quest | undefined>;

const quest = computed(() => localQuest.value || resource?.value);

const objectives = computed(() => {
	const q = quest.value;
	if (!q) {
		return [];
	}
	return q.objectives.sort((a, b) => numberSort(a.sort, b.sort));
});

/** If the QuestActionButton will be accepting the quest or not. */
const isQuestAcceptAction = computed(() => {
	const q = quest.value;
	if (!q || q.isExpired) {
		return false;
	}
	return q.canAccept;
});

const shouldShowActionButton = computed(() => {
	if (hasActionButtonError.value) {
		return false;
	}
	return isQuestAcceptAction.value || objectives.value.some(i => i.has_unclaimed_rewards);
});

async function init() {
	if (isLoading.value) {
		return;
	}
	isLoading.value = true;

	try {
		const payload = await Api.sendFieldsRequest(
			`/mobile/quest/${questId.value}`,
			{ quest: true },
			{ detach: true }
		);

		if (payload.quest) {
			onNewQuest(storeModel(Quest, payload.quest));
		}
	} catch (e) {
		console.error('Failed to load quest data', e);
		hasError.value = true;
	}
	isLoading.value = false;
}

init();

onUnmounted(async () => {
	// Wait a tick in case a different quest window was opened and changed the activeQuestId.
	await nextTick();

	if (activeQuestId.value === questId.value) {
		activeQuest.value = undefined;
	}
});

function closeQuests() {
	// Causes the shell to v-if this away.
	activeQuest.value = undefined;

	// Close the sidebar only for breakpoints that always show it. Mobile
	// breakpoints have the quest window overlay everything, so we should keep
	// the sidebar open.
	if (Screen.isDesktop) {
		toggleLeftPane('');
	}
}

function onNewQuest(data: Quest) {
	localQuest.value = data;

	if (!data.is_new) {
		clearNewQuestIds([data.id], { pushView: true });
	}
	if (!data.has_activity) {
		clearQuestActivityIds([data.id], { pushView: true });
	}
}

const headerHeight = buildCSSPixelValue(300);

// Uses the base padding from `.container` class while allowing the width to
// stretch.
const containerStyles = {
	class: 'container',
	style: {
		maxWidth: `100%`,
		width: `100%`,
	} as CSSProperties,
};

const fillStyles: CSSProperties = {
	width: `100%`,
	height: `100%`,
};
</script>

<template>
	<AppShellWindow :close-callback="closeQuests" avoid-sidebar="md-up">
		<template #default="{ borderRadius }">
			<!--
				Don't include this within the [AppLoadingFade], otherwise we
				won't be able to close through this on slow requests.
			-->
			<div
				class="modal-controls"
				:style="{
					position: `absolute`,
					left: 0,
					top: 0,
					right: 0,
					height: 0,
					zIndex: 2,
				}"
			>
				<AppButton overlay @click="closeQuests">
					<AppTranslate>Close</AppTranslate>
				</AppButton>
			</div>

			<AppLoadingFade
				:is-loading="isLoading"
				:style="fillStyles"
				:content-styles="fillStyles"
			>
				<div
					:style="{
						position: `relative`,
						height: `100%`,
						flex: `auto`,
						display: `flex`,
						flexDirection: `column`,
						minWidth: 0,
						zIndex: 1,
					}"
				>
					<AppScrollScroller
						:style="{
							height: `100%`,
						}"
					>
						<div
							:style="{
								display: `flex`,
								flexDirection: `column`,
								flex: `auto`,
								height: `100%`,
							}"
						>
							<div
								v-if="quest"
								:style="{
									...fillStyles,
									display: `flex`,
									flexDirection: `column`,
								}"
							>
								<div style="position: relative">
									<AppMediaItemBackdrop
										:style="{
											width: `100%`,
											height: headerHeight.px,
											display: `flex`,
											justifyContent: `center`,
											alignItems: `center`,
										}"
										:media-item="quest.header"
									>
										<AppImgResponsive
											:src="quest.header.mediaserver_url"
											:style="{
												position: `absolute`,
												minWidth: `100%`,
												minHeight: `100%`,
												objectFit: `cover`,
											}"
											alt=""
										/>
									</AppMediaItemBackdrop>
								</div>

								<div v-bind="containerStyles">
									<section class="section section-thin">
										<div class="text-center">
											<div
												:style="{
													fontSize: kFontSizeSmall.px,
													textTransform: `uppercase`,
													color: kThemeFgMuted,
												}"
											>
												{{ quest.questType }}
											</div>
											<div
												:style="{
													fontFamily: kFontFamilyDisplay,
													fontSize: `28px`,
												}"
											>
												{{ quest.title }}
											</div>
											<AppQuestTimer
												v-if="quest.ends_on"
												:ends-on="quest.ends_on"
											/>
										</div>
										<AppSpacer vertical :scale="4" />

										<AppContentViewer
											v-if="quest.description_content"
											:source="quest.description_content"
										/>
										<div v-else>{{ quest.description }}</div>

										<AppProgressBarQuest
											:progress="quest.progress_percent"
											:max-progress-ticks="100"
											show-end-display
											is-percent
											:icon="quest.isAllComplete ? 'star' : undefined"
										/>
									</section>

									<section class="section">
										<div
											:style="{
												textTransform: `uppercase`,
												color: kThemeFgMuted,
												fontSize: kFontSizeTiny.px,
												fontWeight: 600,
											}"
										>
											Objectives
										</div>

										<div
											:key="quest.id"
											:style="{
												display: `flex`,
												flexDirection: `column`,
												width: `100%`,
											}"
										>
											<AppQuestObjective
												v-for="objective of objectives"
												:key="objective.id"
												:style="{
													flex: `auto`,
													marginTop: `16px`,
												}"
												:quest="quest"
												:objective="objective"
											/>
										</div>
									</section>
								</div>

								<AppScrollAffix
									v-if="shouldShowActionButton"
									:style="{
										backgroundColor: kThemeBgActual,
										marginTop: `auto`,
									}"
									anchor="bottom"
									:padding="Screen.isXs ? 0 : 16"
									:offset-top="Screen.isXs ? undefined : -17"
								>
									<template #default="{ affixed }">
										<div
											:style="{
												boxShadow: `none`,
												transition: `box-shadow 250ms ${kWeakEaseOut}`,
												borderBottomLeftRadius: borderRadius.px,
												borderBottomRightRadius: borderRadius.px,
												...styleWhen(affixed, {
													backgroundColor: kThemeBgActual,
													boxShadow: `0px 1px 8px rgba(0,0,0, 0.8)`,
												}),
											}"
										>
											<AppQuestActionButton
												:key="quest.id"
												:style="{
													padding: `12px`,
													...styleWhen(!Screen.isXs, {
														padding: `16px`,
													}),
												}"
												:quest="quest"
												:is-accept="isQuestAcceptAction"
												show
												@new-quest="onNewQuest"
												@payload-error="hasActionButtonError = true"
											/>
										</div>
									</template>
								</AppScrollAffix>
							</div>
							<template v-else-if="isLoading">
								<div class="_placeholder-header" />

								<section class="section section-thin">
									<div :style="styleFlexCenter({ direction: 'column' })">
										<div
											class="_placeholder-text"
											:style="{ width: `120px` }"
										/>
										<AppSpacer vertical :scale="1" />
										<div
											class="_placeholder-title"
											:style="{ width: `240px` }"
										/>
									</div>
									<AppSpacer vertical :scale="4" />

									<div v-bind="containerStyles">
										<div
											v-for="i in 4"
											:key="i"
											class="_placeholder-text"
											:style="{
												width: `30%`,
												...styleWhen(i < 4, {
													width: '100%',
													marginBottom: '8px',
												}),
											}"
										/>
									</div>
								</section>
							</template>
							<template v-else>
								<div
									:class="containerStyles.class"
									:style="{
										...containerStyles.style,
										...styleFlexCenter({ direction: 'column' }),
										height: `100%`,
									}"
								>
									<AppIllustration :asset="illExtremeSadness">
										{{
											$gettext(
												`We couldn't find the quest you're looking for.`
											)
										}}
										<AppSpacer vertical :scale="4" />

										<AppButton block @click="closeQuests">
											{{ $gettext(`Close`) }}
										</AppButton>
									</AppIllustration>
								</div>
							</template>
						</div>
					</AppScrollScroller>
				</div>
			</AppLoadingFade>
		</template>
	</AppShellWindow>
</template>

<style lang="stylus" scoped>
._placeholder-header
._placeholder-title
._placeholder-text
	background-color: var(--theme-bg-subtle)

._placeholder-text
._placeholder-title
	rounded-corners-lg()
	height: $line-height-computed

._placeholder-header
	position: relative
	width: 100%
	height: 0
	padding-top: v-bind('headerHeight.px')

._placeholder-title
	height: $line-height-computed * 1.5
</style>
