<script lang="ts">
import { computed, toRef } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { Api } from '../../../../../../../_common/api/api.service';
import AppButton from '../../../../../../../_common/button/AppButton.vue';
import { CommunityChannelModel } from '../../../../../../../_common/community/channel/channel.model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import { vAppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import { showCommunityCompetitionHeaderModal } from '../../../../../../components/community/competition/header-modal/header-modal.service';
import AppPageHeader from '../../../../../../components/page-header/AppPageHeader.vue';
import AppPageHeaderControls from '../../../../../../components/page-header/controls/controls.vue';
import { useCommunityRouteStore } from '../../../view.store';

export default {
	...defineAppRouteOptions({
		deps: { params: ['id', 'channel'] },
		resolver: ({ route }) =>
			Api.sendRequest(
				'/web/dash/communities/channels/' + route.params.id + '/' + route.params.channel
			),
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useCommunityRouteStore()!;

const competition = toRef(() => routeStore.competition);
const channel = toRef(() => routeStore.channel!);
const canEditHeader = toRef(() => !!competition.value);

const pageHeaderProps = computed(() => {
	if (!competition.value) {
		return {};
	}

	return {
		coverMediaItem: competition.value.header,
		coverMaxHeight: 250,
		coverEditable: true,
	};
});

async function onClickEditHeader() {
	await showCommunityCompetitionHeaderModal(competition.value!);
}

createAppRoute({
	onResolved({ payload }) {
		if (payload.channel) {
			const newChannel = new CommunityChannelModel(payload.channel);
			if (channel.value) {
				channel.value.assign(newChannel);
			} else if (newChannel.is_archived) {
				routeStore.archivedChannels.push(newChannel);
			}
		}
	},
});
</script>

<template>
	<!-- Read comment in routeResolved for why the channel might not exist yet. -->
	<div v-if="channel">
		<AppPageHeader v-bind="pageHeaderProps" should-affix-nav @edit-cover="onClickEditHeader">
			<template v-if="canEditHeader" #cover-edit-buttons>
				{{ $gettext(`Upload Header`) }}
			</template>

			<template #default>
				<div class="text-muted small">
					<span v-if="channel.visibility === 'draft'" class="tag">
						{{ $gettext(`Draft`) }}
					</span>
					<span v-else-if="channel.visibility === 'published'" class="tag tag-highlight">
						{{ $gettext(`Published`) }}
					</span>

					<template v-if="competition">
						<span v-if="competition.period === 'pre-comp'" class="tag">
							{{ $gettext(`Future`) }}
						</span>
						<span
							v-else-if="competition.period === 'running'"
							class="tag tag-highlight"
						>
							{{ $gettext(`Running`) }}
						</span>
						<span v-else-if="competition.period === 'voting'" class="tag tag-highlight">
							{{ $gettext(`Voting`) }}
						</span>
						<span v-else-if="competition.period === 'post-comp'" class="tag">
							{{ $gettext(`Finished`) }}
						</span>
					</template>

					<span
						v-if="channel.is_archived"
						v-app-tooltip.touchable="
							$gettext(`This channel was archived and is now read-only`)
						"
						class="tag tag-notice"
					>
						{{ $gettext(`Archived`) }}
					</span>
				</div>

				<h1 class="section-header">
					{{ channel.displayTitle }}
				</h1>
			</template>

			<template #nav>
				<div class="-competition-nav">
					<nav class="platform-list inline">
						<ul>
							<li>
								<RouterLink
									:to="{ name: 'communities.view.edit.channels.overview' }"
									:class="{
										active:
											$route.name ===
											'communities.view.edit.channels.overview',
									}"
								>
									{{ $gettext(`Channel`) }}
								</RouterLink>
							</li>
							<li v-if="competition">
								<RouterLink
									:to="{
										name: 'communities.view.edit.channels.competition.overview',
									}"
									active-class="active"
								>
									{{ $gettext(`Manage Jam`) }}
								</RouterLink>
							</li>
						</ul>
					</nav>
				</div>
			</template>

			<template #controls>
				<AppPageHeaderControls>
					<AppButton
						v-if="competition"
						:to="{
							name: 'communities.view.channel',
						}"
						block
						icon="arrow-forward"
					>
						{{ competition ? $gettext(`View Jam`) : $gettext(`View Channel`) }}
					</AppButton>
				</AppPageHeaderControls>
			</template>
		</AppPageHeader>

		<RouterView />
	</div>
</template>

<style lang="stylus" scoped>
.-nav-container
	padding-bottom: 0

.-competition-nav
	display: flex
	align-items: center

.-btn-back
	margin-right: 32px
</style>
