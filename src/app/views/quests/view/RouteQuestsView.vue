<script lang="ts">
import { computed, ref } from 'vue';
import { numberSort } from '../../../../utils/array';
import { Api } from '../../../../_common/api/api.service';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import AppMediaItemCover from '../../../../_common/media-item/cover/cover.vue';
import AppQuestObjective from '../../../../_common/quest/AppQuestObjective.vue';
import AppProgressBarQuest from '../../../../_common/quest/AppQuestProgress.vue';
import { Quest } from '../../../../_common/quest/quest-model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { $gettext, $gettextInterpolate } from '../../../../_common/translate/translate.service';
import AppUserAvatarList from '../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../_common/user/user.model';

export default {
	...defineAppRouteOptions({
		cache: true,
		deps: {
			params: ['id'],
		},
		resolver: async ({ route }) =>
			Api.sendRequest(
				`/mobile/quest/${route.params.id}`,
				{
					_fields: {
						quest: true,
						participatingFriends: true,
						participatingFriendCount: true,
					},
				},
				{
					sanitizeComplexData: false,
				}
			),
	}),
};
</script>

<script lang="ts" setup>
const quest = ref<Quest>();
const participatingFriends = ref<User[]>([]);
const participatingFriendCount = ref(0);
const isLoading = ref(true);

const objectives = computed(() => {
	const _quest = quest.value;
	if (!_quest) {
		return [];
	}
	return _quest.objectives.sort((a, b) => numberSort(a.sort, b.sort));
});

createAppRoute({
	routeTitle: computed(() => ``),
	onResolved({ payload }) {
		quest.value = new Quest(payload.quest);
		participatingFriends.value = User.populate(payload.participatingFriends);
		participatingFriendCount.value = payload.participatingFriendCount;
		isLoading.value = false;
	},
});

const friendsText = computed(() => {
	const count = participatingFriendCount.value;
	// Not followed by anyone you follow
	if (count === 0) {
		return $gettext(`Not followed by anyone you follow`);
	}

	const users = participatingFriends.value;

	// Followed by name1
	if (users.length === 1) {
		return $gettextInterpolate(`Followed by %{ name1 }`, {
			name1: users[0].display_name,
		});
	}

	// Followed by name1 and name2
	if (users.length === 2) {
		return $gettextInterpolate(`Followed by %{ name1 } and %{ name2 }`, {
			name1: users[0].display_name,
			name2: users[1].display_name,
		});
	}

	// Followed by name1, name2 and name3
	if (users.length >= 3 && count === 3) {
		return $gettextInterpolate(`Followed by %{ name1 }, %{ name2 } and %{ name3 }`, {
			name1: users[0].display_name,
			name2: users[1].display_name,
			name3: users[2].display_name,
		});
	}

	// Followed by name1, name2, name3 and 1 other you follow
	if (users.length >= 3 && count === 4) {
		return $gettextInterpolate(
			`Followed by %{ name1 }, %{ name2 }, %{ name3 } and 1 other you follow`,
			{
				name1: users[0].display_name,
				name2: users[1].display_name,
				name3: users[2].display_name,
			}
		);
	}

	if (users.length >= 3 && count > 4) {
		return $gettextInterpolate(
			`Followed by %{ name1 }, %{ name2 }, %{ name3 } and %{ num } others you follow`,
			{
				name1: users[0].display_name,
				name2: users[1].display_name,
				name3: users[2].display_name,
				num: count - 3,
			}
		);
	}

	// Should not happen...
	if (GJ_BUILD_TYPE === 'development') {
		console.log(
			'Encountered known followers unknown user number for text. Users:',
			users.length,
			'total:',
			count
		);
	}
	return '';
});
</script>

<template>
	<template v-if="quest">
		<AppMediaItemCover :media-item="quest.header" :max-height="250" />

		<div class="container">
			<section class="section section-thin">
				<div class="text-center">
					<div class="-quest-type">{{ quest.questType }}</div>
					<div class="-quest-title">{{ quest.title }}</div>
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
				<div>Objectives</div>

				<div class="-objectives">
					<template v-for="objective of objectives" :key="objective.id">
						<AppSpacer vertical :scale="4" />

						<AppQuestObjective
							class="-objective"
							:quest="quest"
							:objective="objective"
						/>
					</template>
				</div>
			</section>
		</div>
	</template>
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
	padding-top: 25%

.-placeholder-title
	height: $line-height-computed * 1.5

.-center-col
	display: flex
	flex-direction: column
	justify-content: center
	align-items: center

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

.-objectives
	display: flex
	flex-direction: column
	width: 100%

.-objective
	flex: auto
</style>
