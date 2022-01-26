<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { CommunityCompetitionVotingCategory } from '../../../../../../../../../_common/community/competition/voting-category/voting-category.model';
import { Environment } from '../../../../../../../../../_common/environment/environment.service';
import { formatDuration } from '../../../../../../../../../_common/filters/duration';
import { showSuccessGrowl } from '../../../../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../_common/route/route-component';
import { AppTimeAgo } from '../../../../../../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../../../../../../_common/tooltip/tooltip-directive';
import AppCommunityCompetitionDate from '../../../../../../../../components/community/competition/date/date.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../../../view.store';

@Options({
	name: 'RouteCommunitiesViewEditChannelsCompetitionOverview',
	components: {
		AppTimeAgo,
		AppCommunityCompetitionDate,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: { params: ['id', 'channel'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			`/web/dash/communities/competitions/${route.params.id}/${route.params.channel}`
		),
})
export default class RouteCommunitiesViewEditChannelsCompetitionOverview extends BaseRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	votingCategories: CommunityCompetitionVotingCategory[] = [];
	isLoading = true;

	readonly Environment = Environment;
	readonly formatDuration = formatDuration;

	get channel() {
		return this.routeStore.channel!;
	}

	get competition() {
		return this.routeStore.competition!;
	}

	get community() {
		return this.routeStore.community;
	}

	get competitionRuntime() {
		return (this.competition.ends_on - this.competition.starts_on) / 1000;
	}

	get competitionVotingRuntime() {
		return (this.competition.voting_ends_on - this.competition.ends_on) / 1000;
	}

	/** Shows a warning message when voting categories are enabled, but none are set up. */
	get shouldShowCategoryWarning() {
		return (
			!this.isLoading &&
			this.competition.is_voting_enabled &&
			this.competition.has_community_voting &&
			this.competition.voting_type === 'categories' &&
			this.votingCategories.length === 0
		);
	}

	routeResolved($payload: any) {
		if ($payload && $payload.votingCategories) {
			this.votingCategories = CommunityCompetitionVotingCategory.populate(
				$payload.votingCategories
			);
		}
		this.isLoading = false;
	}

	async onClickPublish() {
		const result = await ModalConfirm.show(
			this.$gettext(
				`Are you sure you want to publish your jam? You will not be able to set it back to draft.`
			),
			this.$gettext(`Publish your jam`)
		);

		if (result) {
			await this.channel.$publish();

			showSuccessGrowl(this.$gettext(`Your jam has been published!`));
		}
	}
}
</script>

<template>
	<div>
		<h2 class="sans-margin-top">
			<translate>Jam Overview</translate>
		</h2>
		<p class="help-block">
			<!-- Starts on -->
			<span>
				<template v-if="competition.periodNum === 0">
					<translate>Your jam will start in about</translate>
					{{ ' ' }}
					<app-time-ago without-suffix is-future :date="competition.starts_on" />
				</template>
				<template v-else>
					<translate>Your jam started about</translate>
					{{ ' ' }}
					<app-time-ago :date="competition.starts_on" />
				</template>
			</span>

			<br />

			<!-- Ends on -->
			<span>
				<template v-if="competition.periodNum < 2">
					<translate>It will run for about</translate>
				</template>
				<template v-else>
					<translate>It ran for about</translate>
				</template>
				{{ formatDuration(competitionRuntime, 'en') }}
			</span>

			<br />

			<!-- Voting ends on -->
			<span>
				<template v-if="competition.is_voting_enabled">
					<template v-if="competition.periodNum < 3">
						<translate>Voting will last for about</translate>
					</template>
					<template v-else>
						<translate>Voting lasted for about</translate>
					</template>
					{{ formatDuration(competitionVotingRuntime, 'en') }}
				</template>
				<template v-else>
					<i><translate>Voting is disabled.</translate></i>
				</template>
			</span>
		</p>

		<div v-if="shouldShowCategoryWarning" class="alert alert-notice">
			<p>
				<span v-translate>
					Your jam is set to let users vote within categories once the voting period
					starts. However, <b>no voting categories are set up</b>.
				</span>
			</p>
			<p>
				<span v-translate>
					You must set up voting categories before the jam is over, or users
					<b>will not be able to vote on entries</b>.
				</span>
			</p>

			<app-button
				block
				overlay
				icon="edit"
				:to="{
					name: 'communities.view.edit.channels.competition.voting',
				}"
			>
				<translate>Set Up Voting</translate>
			</app-button>
		</div>

		<div v-if="channel.visibility === 'draft'" class="alert alert-notice">
			<p>
				<span v-translate><b>This jam is a draft</b> and only moderators can view it.</span>
			</p>
			<p>
				<translate>
					You can leave it as a draft and work on it, then publish it when you're ready
					for it to be visible in the community's channel list.
				</translate>
			</p>
			<app-button block overlay icon="active" @click="onClickPublish">
				<translate>Publish</translate>
			</app-button>
		</div>

		<table class="table">
			<tbody>
				<tr>
					<th>
						<translate>Jam name</translate>
						<app-jolticon
							v-app-tooltip.touchable="
								$gettext(
									`The jam's name is the same as the channel's display name.`
								)
							"
							class="text-muted"
							icon="info-circle"
						/>
					</th>
					<td>
						{{ channel.displayTitle }}
					</td>
				</tr>
				<tr>
					<th>
						<translate>URL</translate>
						<app-jolticon
							v-app-tooltip.touchable="
								$gettext(`The jam's URL is the same as the channel's URL path.`)
							"
							class="text-muted"
							icon="info-circle"
						/>
					</th>
					<td>
						<router-link :to="{ name: 'communities.view.channel' }">
							{{ Environment.baseUrl + '/c/' + community.path + '/'
							}}<b>{{ channel.title }}</b>
						</router-link>
					</td>
				</tr>
				<tr>
					<th>
						<translate>Timezone</translate>
					</th>
					<td>
						<template v-if="competition.timezone">
							{{ competition.timezone }}
							<p class="help-block sans-margin-bottom">
								<translate>All jam times are based off this timezone.</translate>
							</p>
						</template>
						<template v-else>
							<span class="help-inline">
								<i><translate>No timezone selected</translate></i>
							</span>
						</template>
					</td>
				</tr>
				<tr>
					<th>
						<translate>Start date</translate>
					</th>
					<td>
						<app-community-competition-date
							:date="competition.starts_on"
							:timezone="competition.timezone"
						/>
					</td>
				</tr>
				<tr>
					<th>
						<translate>End date</translate>
					</th>
					<td>
						<app-community-competition-date
							:date="competition.ends_on"
							:timezone="competition.timezone"
						/>
					</td>
				</tr>
				<tr v-if="competition.is_voting_enabled">
					<th>
						<translate>Voting end date</translate>
					</th>
					<td>
						<app-community-competition-date
							:date="competition.voting_ends_on"
							:timezone="competition.timezone"
						/>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style lang="stylus" scoped></style>
