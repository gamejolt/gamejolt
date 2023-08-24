<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import { CommunityChannelModel } from '../../../../../../../_common/community/channel/channel.model';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import { vAppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { CommunityCompetitionHeaderModal } from '../../../../../../components/community/competition/header-modal/header-modal.service';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';
import AppPageHeader from '../../../../../../components/page-header/AppPageHeader.vue';
import AppPageHeaderControls from '../../../../../../components/page-header/controls/controls.vue';
import AppCommunitiesViewPageContainer from '../../../_page-container/page-container.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../view.store';

@Options({
	name: 'RouteCommunitiesViewEditChannelsEdit',
	components: {
		AppPageHeader,
		AppCommunityPerms,
		AppCommunitiesViewPageContainer,
		AppPageHeaderControls,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	deps: { params: ['id', 'channel'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/communities/channels/' + route.params.id + '/' + route.params.channel
		),
})
export default class RouteCommunitiesViewEditChannelsEdit extends LegacyRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	get competition() {
		return this.routeStore.competition;
	}

	get channel() {
		return this.routeStore.channel!;
	}

	get canEditHeader() {
		return !!this.competition;
	}

	get pageHeaderProps() {
		if (!this.competition) {
			return {};
		}

		return {
			coverMediaItem: this.competition.header,
			coverMaxHeight: 250,
			coverEditable: true,
		};
	}

	routeResolved($payload: any) {
		if ($payload.channel) {
			const channel = new CommunityChannelModel($payload.channel);
			if (this.channel) {
				this.channel.assign(channel);
			} else if (channel.is_archived) {
				this.routeStore.archivedChannels.push(channel);
			}
		}
	}

	async onClickEditHeader() {
		await CommunityCompetitionHeaderModal.show(this.competition!);
	}
}
</script>

<template>
	<!-- Read comment in routeResolved for why the channel might not exist yet. -->
	<div v-if="channel">
		<AppPageHeader v-bind="pageHeaderProps" should-affix-nav @edit-cover="onClickEditHeader">
			<template v-if="canEditHeader" #cover-edit-buttons>
				<AppTranslate>Upload Header</AppTranslate>
			</template>

			<template #default>
				<div class="text-muted small">
					<span v-if="channel.visibility === 'draft'" class="tag">
						<AppTranslate>Draft</AppTranslate>
					</span>
					<span v-else-if="channel.visibility === 'published'" class="tag tag-highlight">
						<AppTranslate>Published</AppTranslate>
					</span>

					<template v-if="competition">
						<span v-if="competition.period === 'pre-comp'" class="tag">
							<AppTranslate>Future</AppTranslate>
						</span>
						<span
							v-else-if="competition.period === 'running'"
							class="tag tag-highlight"
						>
							<AppTranslate>Running</AppTranslate>
						</span>
						<span v-else-if="competition.period === 'voting'" class="tag tag-highlight">
							<AppTranslate>Voting</AppTranslate>
						</span>
						<span v-else-if="competition.period === 'post-comp'" class="tag">
							<AppTranslate>Finished</AppTranslate>
						</span>
					</template>

					<span
						v-if="channel.is_archived"
						v-app-tooltip.touchable="
							$gettext(`This channel was archived and is now read-only`)
						"
						class="tag tag-notice"
					>
						<AppTranslate>Archived</AppTranslate>
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
								<router-link
									:to="{ name: 'communities.view.edit.channels.overview' }"
									:class="{
										active:
											$route.name ===
											'communities.view.edit.channels.overview',
									}"
								>
									<AppTranslate>Channel</AppTranslate>
								</router-link>
							</li>
							<li v-if="competition">
								<router-link
									:to="{
										name: 'communities.view.edit.channels.competition.overview',
									}"
									active-class="active"
								>
									<AppTranslate>Manage Jam</AppTranslate>
								</router-link>
							</li>
						</ul>
					</nav>
				</div>
			</template>

			<template #controls>
				<AppPageHeaderControls>
					<AppButton
						:to="{
							name: 'communities.view.channel',
						}"
						block
						icon="arrow-forward"
					>
						<AppTranslate v-if="competition">View Jam</AppTranslate>
						<AppTranslate v-else>View Channel</AppTranslate>
					</AppButton>
				</AppPageHeaderControls>
			</template>
		</AppPageHeader>

		<router-view />
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
