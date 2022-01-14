<script lang="ts">
import { defineAsyncComponent } from 'vue';
import { setup } from 'vue-class-component';
import { Inject, Options } from 'vue-property-decorator';
import { router } from '../../..';
import { arrayRemove } from '../../../../../utils/array';
import { Api } from '../../../../../_common/api/api.service';
import { CompetitionPeriodVoting } from '../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionEntrySubmitModal } from '../../../../../_common/community/competition/entry/submit-modal/submit-modal.service';
import { CommunityCompetitionVotingCategory } from '../../../../../_common/community/competition/voting-category/voting-category.model';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../../_common/fade-collapse/fade-collapse.vue';
import { formatDate } from '../../../../../_common/filters/date';
import { formatNumber } from '../../../../../_common/filters/number';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import {
	asyncRouteLoader,
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppCommunityCompetitionCountdown from '../../../../components/community/competition/countdown/countdown.vue';
import AppCommunityCompetitionEntryGrid from '../../../../components/community/competition/entry/grid/grid.vue';
import { AppCommunityPerms } from '../../../../components/community/perms/perms';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	getChannelPathFromRoute,
	setCommunityMeta,
} from '../view.store';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';

@Options({
	name: 'RouteCommunitiesViewChannelJam',
	components: {
		AppIllustration,
		AppCommunitiesViewPageContainer,
		AppCommunityCompetitionEntryGrid,
		AppCommunityCompetitionCountdown,
		AppFadeCollapse,
		AppContentViewer,
		AppCommunityPerms,
		RouteCommunitiesViewChannelJamEntries: defineAsyncComponent(() =>
			asyncRouteLoader(router, import('./jam-entries.vue'))
		),
	},
})
@RouteResolver({
	deps: { params: ['path', 'channel'] },
	resolver: ({ route }) => {
		const channel = getChannelPathFromRoute(route);
		return Api.sendRequest(
			`/web/communities/competitions/entries/view/${route.params.path}/${channel}`
		);
	},
})
export default class RouteCommunitiesViewChannelJam extends BaseRouteComponent {
	commonStore = setup(() => useCommonStore());

	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	get user() {
		return this.commonStore.user;
	}

	readonly Screen = Screen;
	readonly formatNumber = formatNumber;
	readonly formatDate = formatDate;

	canToggleDescription = false;
	isDescriptionOpen = false;
	isLoading = true;
	userEntries: CommunityCompetitionEntry[] = [];
	categories: CommunityCompetitionVotingCategory[] = [];

	/** @override */
	disableRouteTitleSuffix = true;

	get community() {
		return this.routeStore.community;
	}

	get channel() {
		return this.routeStore.channel!;
	}

	get competition() {
		return this.routeStore.competition!;
	}

	get shouldShowUserSubmissions() {
		if (this.isLoading) {
			return false;
		}

		// Guests can't submit.
		if (!this.user) {
			return false;
		}

		// Can't submit entries when you are blocked from the community.
		if (this.community.isBlocked) {
			return false;
		}

		// Competition is over and no submissions have been entered.
		if (
			this.competition.periodNum >= CompetitionPeriodVoting &&
			this.userEntries.length === 0
		) {
			return false;
		}

		return true;
	}

	get canSubmitEntry() {
		return (
			this.competition.period === 'running' &&
			this.channel.visibility === 'published' &&
			!this.channel.is_archived
		);
	}

	get hasSubmittedEntries() {
		return this.userEntries.length > 0;
	}

	get routeTitle() {
		return this.$gettextInterpolate(`%{ channel } - %{ name } Community on Game Jolt`, {
			name: this.community.name,
			channel: this.channel.displayTitle,
		});
	}

	routeResolved($payload: any) {
		if ($payload.entries) {
			this.userEntries = CommunityCompetitionEntry.populate($payload.entries);
		}
		if ($payload.categories) {
			this.categories = CommunityCompetitionVotingCategory.populate($payload.categories);
		}
		this.isLoading = false;

		if (this.routeTitle) {
			setCommunityMeta(this.community, this.routeTitle);
		}
	}

	toggleDescription() {
		this.isDescriptionOpen = !this.isDescriptionOpen;
	}

	canToggleDescriptionChanged(canToggle: boolean) {
		this.canToggleDescription = canToggle;
	}

	async onClickSubmit() {
		const result = await CommunityCompetitionEntrySubmitModal.show(this.competition);
		if (result) {
			this.userEntries.unshift(result);

			showSuccessGrowl(this.$gettext(`Successfully submitted your entry to the jam!`));

			// Triggers the grid to refetch.
			this.competition.entry_count++;
		}
	}

	onEntryRemoved(entry: CommunityCompetitionEntry) {
		arrayRemove(this.userEntries, i => i.id === entry.id);

		// Triggers the grid to refetch.
		this.competition.entry_count--;
	}
}
</script>

<template>
	<div>
		<app-communities-view-page-container full>
			<app-community-perms :community="community" perms="community-competitions">
				<app-button
					icon="edit"
					:to="{
						name: 'communities.view.edit.channels.competition.overview',
						params: { id: community.id },
					}"
				>
					<translate>Edit Jam</translate>
				</app-button>
				<hr />
			</app-community-perms>

			<div class="-header">
				<div class="-header-title">
					<h1 :class="{ 'text-center': Screen.isXs, h2: Screen.isMobile }">
						{{ channel.displayTitle }}
					</h1>

					<div v-if="!competition.hasEnded" class="-header-subtitle text-muted">
						Submissions are open <b>{{ formatDate(competition.starts_on) }}</b> to
						<b>{{ formatDate(competition.ends_on) }}</b>
					</div>
				</div>
				<div class="-header-end">
					<div class="-header-meta">
						<app-community-competition-countdown :competition="competition" />
					</div>
					<div v-if="canSubmitEntry" class="-header-actions">
						<app-button primary solid @click="onClickSubmit">
							<translate>Submit an entry</translate>
						</app-button>
					</div>
				</div>
			</div>

			<div v-if="channel.description_content" class="sheet sheet-elevate">
				<app-fade-collapse
					:collapse-height="500"
					:is-open="isDescriptionOpen"
					@require-change="canToggleDescriptionChanged"
				>
					<app-content-viewer :source="channel.description_content" />
				</app-fade-collapse>

				<div v-if="canToggleDescription" class="page-cut page-cut-no-margin">
					<app-button trans @click="toggleDescription()">
						<translate v-if="!isDescriptionOpen">Show More</translate>
						<translate v-else>Less</translate>
					</app-button>
				</div>
			</div>

			<template v-if="shouldShowUserSubmissions">
				<h2>
					<translate>Your submissions</translate>

					<div v-if="canSubmitEntry" class="-submission-button">
						<app-button @click="onClickSubmit">
							<translate>Submit an entry</translate>
						</app-button>
					</div>
				</h2>

				<template v-if="canSubmitEntry">
					<p v-if="!hasSubmittedEntries" class="help-block">
						<translate>You have not submitted an entry to this jam... yet?</translate>
					</p>
				</template>
				<template v-else-if="competition.period === 'pre-comp'">
					<p class="help-block">
						<translate>
							You'll be able to submit your entry from this page once the jam starts.
						</translate>
					</p>
				</template>
				<template v-else-if="competition.periodNum >= 2">
					<p class="help-block">
						<translate>The jam has ended and submissions are now closed.</translate>
					</p>
				</template>
				<template v-else-if="channel.visibility === 'draft'">
					<p v-if="!hasSubmittedEntries" class="help-block">
						<translate>
							The jam is set up as a draft. Publish the jam to open submissions.
						</translate>
					</p>
				</template>
				<template v-else-if="channel.is_archived">
					<p class="help-block">
						<translate>
							This channel is archived and entries cannot be submitted.
						</translate>
					</p>
				</template>

				<div v-if="hasSubmittedEntries">
					<app-community-competition-entry-grid
						:competition="competition"
						:num-placeholders="2"
						:entries="userEntries"
						show-remove
						@remove="onEntryRemoved($event)"
					/>
				</div>

				<br />
			</template>

			<template v-if="competition.hasStarted">
				<route-communities-view-channel-jam-entries :categories="categories" />
			</template>
		</app-communities-view-page-container>
	</div>
</template>

<style lang="stylus" scoped>
.-header
	display: flex
	flex-direction: column
	align-items: center

	&-title
		flex: auto
		margin-bottom: $line-height-computed

		h1
			margin-top: 0

	&-end
		display: flex
		flex-direction: column
		align-items: center

	&-meta
		flex: none
		text-align: center

	&-actions
		flex: none
		margin-bottom: $line-height-computed

	@media $media-sm-up
		flex-direction: row
		align-items: flex-start

		&-title
			h1
				margin-bottom: 0

		&-subtitle
			margin-top: $line-height-computed

		&-end
			flex: none
			display: flex
			flex-direction: column
			align-items: flex-end
			margin-left: ($grid-gutter-width / 2)

		&-meta
			text-align: left

	@media $media-md-up
		&-subtitle
			margin-top: 0

		&-end
			flex-direction: row
			align-items: flex-start

		&-actions
			margin-left: ($grid-gutter-width / 2)

@media $media-sm-up
	.-submission-button
		display: inline-block
		margin-left: $grid-gutter-width
</style>
