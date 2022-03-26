<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import AppMediaItemCover from '../../../../_common/media-item/cover/cover.vue';
import AppProgressBar from '../../../../_common/progress/AppProgressBar.vue';
import { Quest } from '../../../../_common/quest/quest-model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
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

createAppRoute({
	routeTitle: computed(() => ``),
	onResolved({ payload }) {
		quest.value = new Quest(payload.quest);
		participatingFriends.value = User.populate(payload.participatingFriends);
		participatingFriendCount.value = payload.participatingFriendCount;
	},
});
</script>

<template>
	<template v-if="quest">
		<AppMediaItemCover :media-item="quest.header" :max-height="250" />

		<div class="container">
			<section class="section section-thin">
				<div class="text-center">
					<div class="-quest-type">World Event / Daily</div>
					<div class="-quest-title">{{ quest.title }}</div>
				</div>

				<AppSpacer vertical :scale="4" />

				<AppContentViewer
					v-if="quest.description_content"
					:source="quest.description_content"
				/>
				<div v-else>{{ quest.description }}</div>

				<AppProgressBar :percent="20" thin glow />

				<template v-if="participatingFriendCount > 0">
					<AppSpacer vertical :spacer="4" />

					<div class="-friends">
						<div>
							<AppUserAvatarList :users="participatingFriends" sm inline />
						</div>
					</div>
				</template>
			</section>

			<section class="section">
				<div class="-subheading">Objectives</div>

				<div class="-quest-objectives">
					<template v-for="objective of quest.objectives" :key="objective.id">
						<AppSpacer vertical :scale="4" />

						<div class="-quest-objective">
							<div class="-quest-objective-status">
								<div class="-incomplete" />
							</div>
							<AppSpacer horizontal :scale="4" />
							<div class="-quest-objective-details">
								<div class="-quest-objective-title">
									{{ objective.title }}
								</div>
							</div>
						</div>
					</template>
				</div>
			</section>
		</div>
	</template>
</template>

<style lang="stylus" scoped>
.-quest-title
	font-family: 'Germania'
	font-size: 28px

.-quest-type
	font-size: $font-size-small
	text-transform: uppercase
	color: var(--theme-fg-muted)

.-friends
	display: flex
	justify-content: center

.-quest-objective
	display: flex

.-quest-objective-status
	position: relative
	display: flex
	align-items: center
	justify-content: center
	top: 2px
	width: 16px
	height: 16px

	.-incomplete
		width: 8px
		height: 2px
		border-radius: 2px
		background-color: var(--theme-fg-muted)
</style>
