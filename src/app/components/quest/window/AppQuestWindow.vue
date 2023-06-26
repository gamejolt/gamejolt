<script lang="ts" setup>
import {
	CSSProperties,
	PropType,
	Ref,
	computed,
	nextTick,
	onMounted,
	onUnmounted,
	ref,
	toRefs,
} from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
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
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext, $gettextInterpolate } from '../../../../_common/translate/translate.service';
import AppUserAvatarList from '../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../_common/user/user.model';
import { styleFlexCenter } from '../../../../_styles/mixins';
import { kBorderRadiusLg, kFontFamilyDisplay } from '../../../../_styles/variables';
import { numberSort } from '../../../../utils/array';
import { illExtremeSadness } from '../../../img/ill/illustrations';
import { useQuestStore } from '../../../store/quest';
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

const { clearNewQuestIds, clearQuestActivityIds, activeQuest } = useQuestStore();

const isLoading = ref(false);
const hasError = ref(false);
const hasActionButtonError = ref(false);

const participatingFriends = ref<User[]>([]);
const participatingFriendCount = ref(0);

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

const friendsText = computed(() => {
	const count = participatingFriendCount.value;
	if (count <= 0) {
		return $gettext(`None of your friends have started this quest`);
	}

	const users = participatingFriends.value;

	if (users.length === 1) {
		return $gettextInterpolate(`%{ name1 } has started this quest!`, {
			name1: users[0].display_name,
		});
	}

	if (users.length === 2) {
		return $gettextInterpolate(`%{ name1 } and %{ name2 } have started this quest!`, {
			name1: users[0].display_name,
			name2: users[1].display_name,
		});
	}

	if (users.length >= 3 && count === 3) {
		return $gettextInterpolate(
			`%{ name1 }, %{ name2 } and %{ name3 } have started this quest!`,
			{
				name1: users[0].display_name,
				name2: users[1].display_name,
				name3: users[2].display_name,
			}
		);
	}

	if (users.length >= 3 && count === 4) {
		return $gettextInterpolate(
			`%{ name1 }, %{ name2 }, %{ name3 } and 1 other friend have started this quest!`,
			{
				name1: users[0].display_name,
				name2: users[1].display_name,
				name3: users[2].display_name,
			}
		);
	}

	if (users.length >= 3 && count > 4) {
		return $gettextInterpolate(
			`%{ name1 }, %{ name2 }, %{ name3 } and %{ num } other friends have started this quest!`,
			{
				name1: users[0].display_name,
				name2: users[1].display_name,
				name3: users[2].display_name,
				num: count - 3,
			}
		);
	}

	if (GJ_ENVIRONMENT === 'development' || GJ_IS_STAGING) {
		console.error('Encountered known followers unknown user number for text.', {
			users: users.length,
			count: count,
		});
	}
	return '';
});

async function init() {
	if (isLoading.value) {
		return;
	}
	isLoading.value = true;

	try {
		const payload = await Api.sendFieldsRequest(
			`/mobile/quest/${questId.value}`,
			{
				quest: true,
				participatingFriends: true,
				participatingFriendCount: true,
			},
			{ detach: true }
		);
		participatingFriends.value = User.populate(payload.participatingFriends);
		participatingFriendCount.value = payload.participatingFriendCount;
		if (payload.quest) {
			onNewQuest(storeModel(Quest, payload.quest));
		}
	} catch (e) {
		console.error('Failed to load quest data', e);
		hasError.value = true;
	}
	isLoading.value = false;
}

onMounted(async () => {
	await init();
});

onUnmounted(async () => {
	// Wait a tick in case a different quest window was opened and changed the activeQuestId.
	await nextTick();
	const activeQuestId =
		typeof activeQuest.value === 'number' ? activeQuest.value : activeQuest.value?.id;

	if (activeQuestId === questId.value) {
		activeQuest.value = null;
	}
});

function close() {
	// Causes the shell to v-if this away.
	activeQuest.value = null;
}

function onNewQuest(data: Quest) {
	if (!data.is_new) {
		clearNewQuestIds([data.id], { pushView: true });
	}
	if (!data.has_activity) {
		clearQuestActivityIds([data.id], { pushView: true });
	}
}

// Uses the base padding from `.container` class while allowing the width to
// stretch.
const containerStyles = {
	class: 'container',
	style: {
		maxWidth: `100%`,
		width: `100%`,
	} as CSSProperties,
};
</script>

<template>
	<div class="quest-window">
		<!-- We sadly need the chat close thing twice. It takes up the empty
		background space so you can click that to close. -->
		<div class="_close" @click="close" />

		<div class="_window">
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
				<AppButton overlay @click="close">
					<AppTranslate>Close</AppTranslate>
				</AppButton>
			</div>

			<AppLoadingFade
				:is-loading="isLoading"
				:style="{
					width: `100%`,
					height: `100%`,
				}"
				:content-styles="{
					width: `100%`,
					height: `100%`,
				}"
			>
				<div class="_close" @click="close" />

				<div class="_window-main">
					<AppScrollScroller :style="{ height: `100%` }">
						<div class="_body" :style="{ height: `100%` }">
							<div v-if="quest" class="_view">
								<div style="position: relative">
									<AppMediaItemBackdrop
										class="_header"
										:media-item="quest.header"
									>
										<AppImgResponsive
											class="_header-img"
											:src="quest.header.mediaserver_url"
											:style="{
												width: `${300 * (1 / quest.header.aspectRatio)}px`,
											}"
											alt=""
										/>
									</AppMediaItemBackdrop>
								</div>

								<div v-bind="containerStyles">
									<section class="section section-thin">
										<div class="text-center">
											<div class="_quest-type">{{ quest.questType }}</div>
											<div class="_quest-title">{{ quest.title }}</div>
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

										<template v-if="participatingFriendCount > 0">
											<AppSpacer vertical :scale="4" />

											<div class="_friends">
												<div>
													<AppUserAvatarList
														class="_friends-list"
														:users="participatingFriends"
														sm
														inline
													/>
												</div>
												<span>
													{{ friendsText }}
												</span>
											</div>
										</template>
									</section>

									<section class="section">
										<div class="_objectives-header">Objectives</div>

										<div :key="quest.id" class="_objectives">
											<template
												v-for="objective of objectives"
												:key="objective.id"
											>
												<AppSpacer vertical :scale="4" />

												<AppQuestObjective
													class="_objective"
													:quest="quest"
													:objective="objective"
												/>
											</template>
										</div>
									</section>
								</div>

								<AppScrollAffix
									v-if="shouldShowActionButton"
									class="_action-button-container"
									anchor="bottom"
									:padding="Screen.isXs ? 0 : 16"
									:offset-top="Screen.isXs ? undefined : -17"
								>
									<div class="_action-button-decorator">
										<AppQuestActionButton
											:key="quest.id"
											class="_action-button"
											:quest="quest"
											:is-accept="isQuestAcceptAction"
											show
											@new-quest="onNewQuest"
											@payload-error="hasActionButtonError = true"
										/>
									</div>
								</AppScrollAffix>
							</div>
							<template v-else-if="isLoading">
								<div class="_placeholder-header" />

								<section class="section section-thin">
									<div class="_center-col">
										<div class="_placeholder-text" style="width: 120px" />
										<AppSpacer vertical :scale="1" />
										<div class="_placeholder-title" style="width: 240px" />
									</div>
									<AppSpacer vertical :scale="4" />

									<div v-bind="containerStyles">
										<template v-for="i in 4" :key="i">
											<div
												class="placeholder-text"
												:style="{
													width: i < 4 ? '100%' : '30%',
													height: '15px',
													borderRadius: '8px',
													backgroundColor: 'var(--theme-bg-subtle)',
												}"
											/>
											<AppSpacer v-if="i < 4" vertical :scale="2" />
										</template>
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

										<AppButton block @click="close">
											{{ $gettext(`Close`) }}
										</AppButton>
									</AppIllustration>
								</div>
							</template>
						</div>
					</AppScrollScroller>
				</div>
			</AppLoadingFade>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-zindex-close = 0
$-zindex-window-inner = 1

$-header-height = 300px
$-font-size-title = 28px
$-font-size = $font-size-small

.quest-window
	position: fixed
	display: flex
	justify-content: center
	align-items: flex-start
	z-index: $zindex-chat-window
	padding: 16px 20px 16px 16px

._close
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	background: transparent
	z-index: $-zindex-close

._window
	change-bg(bg)
	position: relative
	display: flex
	flex: auto
	justify-content: center
	width: 100%
	height: 100%
	z-index: $-zindex-window-inner
	overflow: hidden

	@media $media-xs
		position: fixed
		top: 0
		right: 0
		left: 0
		bottom: 0
		height: auto !important
		width: auto !important

	@media $media-sm-up
		rounded-corners-lg()

		._action-button-decorator
			border-bottom-left-radius: v-bind('kBorderRadiusLg.px')
			border-bottom-right-radius: v-bind('kBorderRadiusLg.px')

._window-main
	position: relative
	height: 100%
	flex: auto
	display: flex
	flex-direction: column
	min-width: 0
	z-index: $-zindex-window-inner

._body
	display: flex
	flex-direction: column
	flex: auto

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
	padding-top: $-header-height

._placeholder-title
	height: $line-height-computed * 1.5

._center-col
	display: flex
	flex-direction: column
	justify-content: center
	align-items: center

._view
	display: flex
	flex-direction: column
	width: 100%
	height: 100%

._header
	width: 100%
	height: $-header-height
	display: flex
	justify-content: center
	align-items: center

._header-img
	position: absolute
	min-width: 100%
	min-height: 100%
	object-fit: cover
	max-width: unset

._action-button-container
	background-color: var(--theme-bg-actual)
	margin-top: auto
	border-radius: inherit

._action-button-decorator
	box-shadow: none
	transition: box-shadow 250ms $weak-ease-out

	::v-deep(.gj-scroll-affixed) &
		background-color: var(--theme-bg-actual)
		box-shadow: 0px 1px 8px rgba($black, 0.8)

._action-button
	padding: 12px

	@media $media-sm-up
		padding: 16px

._quest-title
	font-family: v-bind(kFontFamilyDisplay)
	font-size: 28px

._quest-type
	font-size: $-font-size
	text-transform: uppercase
	color: var(--theme-fg-muted)

._friends
	display: flex
	justify-content: center
	align-items: center
	font-size: $-font-size
	color: var(--theme-fg-muted)
	font-weight: 400

._friends-list
	margin-right: 16px

._objectives-header
	text-transform: uppercase
	color: var(--theme-fg-muted)
	font-size: $font-size-tiny
	font-weight: 600

._objectives
	display: flex
	flex-direction: column
	width: 100%

._objective
	flex: auto
</style>
