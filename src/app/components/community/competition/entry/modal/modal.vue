<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options, Prop } from 'vue-property-decorator';
import { numberSort } from '../../../../../../utils/array';
import { Api } from '../../../../../../_common/api/api.service';
import { Clipboard } from '../../../../../../_common/clipboard/clipboard-service';
import { CommunityCompetition } from '../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionEntryVote } from '../../../../../../_common/community/competition/entry/vote/vote.model';
import { CommunityCompetitionVotingCategory } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { formatDate } from '../../../../../../_common/filters/date';
import AppLoading from '../../../../../../_common/loading/AppLoading.vue';
import { BaseModal } from '../../../../../../_common/modal/base';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import { AppTimeAgo } from '../../../../../../_common/time/ago/ago';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import AppUserCardHover from '../../../../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatar from '../../../../../../_common/user/user-avatar/AppUserAvatar.vue';
import AppUserVerifiedTick from '../../../../../../_common/user/verified-tick/AppUserVerifiedTick.vue';
import AppGameBadge from '../../../../game/badge/badge.vue';
import AppCommunityCompetitionVotingWidget from '../../voting/widget.vue';

@Options({
	components: {
		AppTimeAgo,
		AppUserCardHover,
		AppUserVerifiedTick,
		AppUserAvatar,
		AppLoading,
		AppCommunityCompetitionVotingWidget,
		AppGameBadge,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppCommunityCompetitionEntryModal extends mixins(BaseModal) {
	@Prop(Object) entry?: CommunityCompetitionEntry;
	@Prop(Number) entryId?: number;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	m_entry: CommunityCompetitionEntry | null = null;
	competition: CommunityCompetition | null = null;
	votingCategories: CommunityCompetitionVotingCategory[] = [];
	userVotes: CommunityCompetitionEntryVote[] = [];
	isParticipant = false;
	isArchived = false;
	isBlocked = false;
	isLoading = true;

	readonly Screen = Screen;
	readonly formatDate = formatDate;

	get title() {
		return this.m_entry ? this.m_entry.resource.title : this.$gettext(`Loading...`);
	}

	get author() {
		return this.m_entry!.author;
	}

	get shouldShowVoteCount() {
		return (
			this.m_entry &&
			this.competition &&
			this.m_entry.vote_count > 0 &&
			!this.competition.are_results_calculated
		);
	}

	get shouldShowAwards() {
		return (
			this.competition &&
			this.competition.has_awards &&
			this.m_entry &&
			this.m_entry.awards &&
			this.m_entry.awards.length > 0
		);
	}

	get sortedAwards() {
		return this.m_entry!.awards!.sort((a, b) =>
			numberSort(a.community_competition_award.sort, b.community_competition_award.sort)
		);
	}

	created() {
		if (this.entry) {
			this.m_entry = this.entry;
		}
	}

	async mounted() {
		const entryId = this.entryId || this.entry?.id;
		if (!entryId) {
			throw new Error('Entry or entryId has to be provided.');
		}

		const payload = await Api.sendRequest(
			`/web/communities/competitions/entries/view-entry/${entryId}`
		);

		this.isParticipant = payload.isParticipant;
		this.isArchived = payload.isArchived;
		this.isBlocked = payload.isBlocked;

		if (this.m_entry) {
			this.m_entry.assign(payload.entry);
		} else {
			this.m_entry = new CommunityCompetitionEntry(payload.entry);
		}

		this.competition = new CommunityCompetition(payload.competition);

		if (payload.votingCategories) {
			this.votingCategories = CommunityCompetitionVotingCategory.populate(
				payload.votingCategories
			);
		}
		if (payload.userVotes) {
			this.userVotes = CommunityCompetitionEntryVote.populate(payload.userVotes);
		}

		this.isLoading = false;
	}

	copyShareUrl() {
		Clipboard.copy(this.m_entry!.permalink);
	}
}
</script>

<template>
	<AppModal class="-entry-modal">
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>
		<div class="modal-body">
			<template v-if="!!m_entry">
				<AppGameBadge full-bleed :game="m_entry.resource" />

				<div class="-section">
					<div class="pull-right">
						<AppUserCardHover :user="author">
							<AppUserAvatar class="-author-avatar" :user="author" />
						</AppUserCardHover>
					</div>
					<div>
						<div class="-author-name">
							<AppTranslate>By</AppTranslate>
							<AppUserCardHover class="-hover-card" :user="author">
								<router-link
									:to="{
										name: 'profile.overview',
										params: { username: author.username },
									}"
								>
									{{ author.display_name }}
									<AppUserVerifiedTick :user="author" />
								</router-link>
							</AppUserCardHover>
						</div>
						<div class="-entered-date">
							<AppTranslate>Entered on</AppTranslate>
							<b>{{ formatDate(m_entry.added_on, 'short') }}</b>
							<i class="text-muted">
								(<AppTimeAgo :date="m_entry.added_on" strict />)
							</i>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-sm-6 -entry-button">
						<AppButton
							block
							primary
							icon="chevron-right"
							:to="m_entry.resource.routeLocation"
						>
							<AppTranslate>View Game</AppTranslate>
						</AppButton>
					</div>
					<div class="col-sm-6 -entry-button">
						<AppButton block icon="link" @click="copyShareUrl">
							<AppTranslate>Copy Voting Link</AppTranslate>
						</AppButton>
					</div>
				</div>

				<div v-if="m_entry.is_removed" class="-section alert alert-notice">
					<p>
						<AppTranslate>
							This entry was removed from the jam and cannot be viewed anymore.
						</AppTranslate>
					</p>
				</div>

				<div v-if="shouldShowAwards">
					<div v-for="entryAward of sortedAwards" :key="entryAward.id" class="-award">
						<AppJolticon
							v-app-tooltip.touchable="$gettext(`Jam Award`)"
							class="-award-icon"
							icon="medal"
							big
						/>
						<div class="-award-details">
							<h4 class="sans-margin">
								{{ entryAward.community_competition_award.name }}
							</h4>
							<div v-if="entryAward.community_competition_award.description">
								<small>
									{{ entryAward.community_competition_award.description }}
								</small>
							</div>
						</div>
					</div>
				</div>

				<div class="-section">
					<span v-if="shouldShowVoteCount" class="-vote-count">
						<AppTranslate
							:translate-n="m_entry.vote_count"
							:translate-params="{ count: m_entry.vote_count }"
							translate-plural="This entry has %{ count } votes, currently. Check back after the voting period to see the final results."
						>
							This entry has %{ count } vote, currently. Check back after the voting
							period to see the final results.
						</AppTranslate>
					</span>

					<template v-if="competition">
						<AppCommunityCompetitionVotingWidget
							:competition="competition"
							:entry="m_entry"
							:voting-categories="votingCategories"
							:user-votes="userVotes"
							:is-participant="isParticipant"
							:is-archived="isArchived"
							:is-blocked="isBlocked"
						/>
					</template>
					<AppLoading v-else centered />
				</div>
			</template>

			<AppLoading v-else centered />
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-section
	margin-bottom: 24px

.-author
	&-name
		font-size: $font-size-large

	&-avatar
		width: 46px

.-hover-card
	display: inline-block !important

.-entry-button
	margin-bottom: 4px

.-vote-count
.-entered-date
	font-size: $font-size-small

.-award
	margin-top: 16px
	change-bg('bi-bg')
	color: var(--theme-bi-fg)
	padding: 16px
	rounded-corners-lg()

	&-icon
		float: left
		display: block

	&-details
		margin-left: 64px
		margin-top: 4px
</style>
