<script lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import AppQuestActionButton from '../../../../_common/quest/AppQuestActionButton.vue';
import AppQuestObjective from '../../../../_common/quest/AppQuestObjective.vue';
import AppProgressBarQuest from '../../../../_common/quest/AppQuestProgress.vue';
import AppQuestReward from '../../../../_common/quest/AppQuestReward.vue';
import { Quest } from '../../../../_common/quest/quest-model';
import { QuestReward } from '../../../../_common/quest/quest-reward-model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext, $gettextInterpolate } from '../../../../_common/translate/translate.service';
import AppUserAvatarList from '../../../../_common/user/user-avatar/AppUserAvatarList.vue';
import { User } from '../../../../_common/user/user.model';
import { numberSort } from '../../../../utils/array';
import AppQuestTimer from '../../../components/quest/AppQuestTimer.vue';
import { useQuestStore } from '../../../store/quest';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		deps: {
			params: ['id'],
		},
		resolver: async ({ route }) =>
			Api.sendFieldsRequest(`/mobile/quest/${route.params.id}`, {
				quest: true,
				participatingFriends: true,
				participatingFriendCount: true,
			}),
	}),
};
</script>

<script lang="ts" setup>
const { updateQuest, clearNewQuestIds, clearQuestActivityIds } = useQuestStore();

const quest = ref<Quest>();
const participatingFriends = ref<User[]>([]);
const participatingFriendCount = ref(0);
const isLoading = ref(true);

const hasActionButtonError = ref(false);

const objectives = computed(() => {
	const _quest = quest.value;
	if (!_quest) {
		return [];
	}
	return _quest.objectives.sort((a, b) => numberSort(a.sort, b.sort));
});

const rewards = computed(() => {
	const _quest = quest.value;
	if (!_quest) {
		return [];
	}

	const rewards = new Map<string, QuestReward>();

	for (const reward of _quest.rewards) {
		const rewardKey = reward.getGroupKey();
		if (rewards.has(rewardKey)) {
			rewards.get(rewardKey)!.amount += reward.amount;
		} else {
			const fakeReward = new QuestReward({
				...reward,
				amount: reward.amount,
			});
			rewards.set(rewardKey, fakeReward);
		}
	}

	return rewards.values();
});

createAppRoute({
	// routeTitle is handled through the parent route.
	onResolved({ payload }) {
		participatingFriends.value = User.populate(payload.participatingFriends);
		participatingFriendCount.value = payload.participatingFriendCount;
		if (payload.quest) {
			onNewQuest(new Quest(payload.quest));
		}
		isLoading.value = false;
	},
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
		console.log(
			'Encountered known followers unknown user number for text. Users:',
			users.length,
			'total:',
			count
		);
	}
	return '';
});

function onNewQuest(data: Quest) {
	quest.value = data;

	if (!data.is_new) {
		clearNewQuestIds([data.id], { pushView: true });
	}
	if (!data.has_activity) {
		clearQuestActivityIds([data.id], { pushView: true });
	}

	updateQuest(data);
}
</script>

<template>
	<div v-if="quest" class="-view">
		<div style="position: relative">
			<AppMediaItemBackdrop class="-header" :media-item="quest.header">
				<AppImgResponsive
					class="-header-img"
					:src="quest.header.mediaserver_url"
					:style="{
						width: `calc(300px * (1 / ${quest.header.aspectRatio}))`,
					}"
					alt=""
				/>
			</AppMediaItemBackdrop>

			<template v-if="Screen.isMobile">
				<div class="-header-shadow" />
				<RouterLink
					class="-back"
					:to="{
						name: 'quests',
					}"
				>
					<AppJolticon icon="chevron-left" />
					<AppSpacer horizontal :scale="1" />
					<AppTranslate :translate-params="{ screen: 'My Quests' }">
						View %{ screen }
					</AppTranslate>
				</RouterLink>
			</template>
		</div>

		<div class="container">
			<section class="section section-thin">
				<div class="text-center">
					<div class="-quest-type">{{ quest.questType }}</div>
					<div class="-quest-title">{{ quest.title }}</div>
					<template v-if="quest.ends_on">
						<AppQuestTimer :ends-on="quest.ends_on" />
					</template>
				</div>
				<AppSpacer vertical :scale="4" />

				<div v-if="quest.total_stages > 1">
					<strong>
						{{
							$gettextInterpolate(`Stage %{currentStage}/%{totalStages}`, {
								currentStage: quest.current_stage,
								totalStages: quest.total_stages,
							})
						}}
					</strong>

					<AppSpacer vertical :scale="2" />
				</div>

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

					<div class="-friends">
						<div>
							<AppUserAvatarList
								class="-friends-list"
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
					<template v-for="objective of objectives" :key="objective.id">
						<AppSpacer vertical :scale="4" />

						<AppQuestObjective
							class="_objective"
							:quest="quest"
							:objective="objective"
						/>
					</template>
				</div>
			</section>

			<section v-if="quest.rewards.length > 0" class="section" :style="{ paddingTop: '0' }">
				<div class="_rewards-header">Rewards</div>
				<div :key="quest.id" class="_rewards">
					<template v-for="reward of rewards" :key="reward.id">
						<AppQuestReward :reward="reward" class="anim-fade-in-right stagger" />
					</template>
				</div>
			</section>
		</div>

		<AppScrollAffix
			v-if="shouldShowActionButton"
			class="-action-button-container"
			anchor="bottom"
			:padding="0"
		>
			<div class="-action-button-decorator">
				<AppQuestActionButton
					:key="quest.id"
					class="-action-button container"
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
		<div class="-placeholder-header" />

		<div class="container">
			<section class="section section-thin">
				<div class="-center-col">
					<div class="-placeholder-text" style="width: 120px" />
					<AppSpacer vertical :scale="1" />
					<div class="-placeholder-title" style="width: 240px" />
				</div>
				<AppSpacer vertical :scale="4" />

				<div>
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
		</div>
	</template>
</template>

<style lang="stylus" scoped>
$-header-height = 300px
$-font-size-title = 28px
$-font-size = $font-size-small

.-placeholder-header
.-placeholder-title
.-placeholder-text
		background-color: var(--theme-bg-subtle)

.-placeholder-text
.-placeholder-title
	rounded-corners-lg()
	height: $line-height-computed

.-placeholder-header
	position: relative
	width: 100%
	padding-top: $-header-height

.-placeholder-title
	height: $line-height-computed * 1.5

.-center-col
	display: flex
	flex-direction: column
	justify-content: center
	align-items: center

.-view
	display: flex
	flex-direction: column
	height: 100%

.-header
	width: 100%
	height: $-header-height
	display: flex
	justify-content: center
	align-items: center

.-header-img
	position: absolute
	min-width: 100%
	min-height: 100%
	object-fit: cover
	max-width: unset

.-action-button-container
	background-color: var(--theme-bg-actual)
	margin-top: auto

.-action-button-decorator
	box-shadow: none
	transition: box-shadow 250ms $weak-ease-out

	::v-deep(.gj-scroll-affixed) &
		background-color: var(--theme-bg-actual)
		box-shadow: 0px 1px 8px rgba($black, 0.8)

.-action-button
	padding: 12px

	@media $media-sm-up
		padding: 16px

.-header-shadow
	background-image: linear-gradient(to bottom, rgba(black, 0.5), transparent)
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0

.-back
	overlay-text-shadow()
	position: absolute
	left: 8px
	top: 8px
	display: inline-flex
	align-items: center
	color: white
	font-size: $font-size-large
	font-weight: 700

	.jolticon
		font-size: 24px

.-quest-title
	font-family: 'Germania'
	font-size: 28px

.-quest-type
	font-size: $-font-size
	text-transform: uppercase
	color: var(--theme-fg-muted)

.-friends
	display: flex
	justify-content: center
	align-items: center
	font-size: $-font-size
	color: var(--theme-fg-muted)
	font-weight: 400

.-friends-list
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

._rewards-header
	text-transform: uppercase
	color: var(--theme-fg-muted)
	font-size: $font-size-tiny
	font-weight: 600

._rewards
	margin-top: 12px
	display: flex
	grid-gap: 12px
</style>
