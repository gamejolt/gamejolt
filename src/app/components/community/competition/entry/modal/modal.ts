import { Component, Prop } from 'vue-property-decorator';
import { numberSort } from '../../../../../../utils/array';
import { propOptional } from '../../../../../../utils/vue';
import { Api } from '../../../../../../_common/api/api.service';
import { Clipboard } from '../../../../../../_common/clipboard/clipboard-service';
import { CommunityCompetition } from '../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionEntryVote } from '../../../../../../_common/community/competition/entry/vote/vote.model';
import { CommunityCompetitionVotingCategory } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { date } from '../../../../../../_common/filters/date';
import AppGameThumbnailImg from '../../../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import AppLoading from '../../../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../../../_common/modal/base';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../../../_common/store/app-store';
import { AppTimeAgo } from '../../../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import AppUserCardHover from '../../../../../../_common/user/card/hover/hover.vue';
import AppUserAvatar from '../../../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../../../_common/user/verified-tick/verified-tick.vue';
import { ActivityFeedService } from '../../../../activity/feed/feed-service';
import AppActivityFeedPlaceholder from '../../../../activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../../../activity/feed/view';
import AppGameBadge from '../../../../game/badge/badge.vue';
import AppGameFollowWidget from '../../../../game/follow-widget/follow-widget.vue';
import { AppActivityFeedLazy } from '../../../../lazy';
import AppCommunityCompetitionVotingWidget from '../../voting/widget.vue';

@Component({
	components: {
		AppGameThumbnailImg,
		AppTimeAgo,
		AppUserCardHover,
		AppUserVerifiedTick,
		AppUserAvatar,
		AppLoading,
		AppCommunityCompetitionVotingWidget,
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
		AppGameFollowWidget,
		AppGameBadge,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		date,
	},
})
export default class AppCommunityCompetitionEntryModal extends BaseModal {
	@Prop(propOptional(CommunityCompetitionEntry)) entry?: CommunityCompetitionEntry;
	@Prop(propOptional(Number)) entryId?: number;

	@AppState
	user!: AppStore['user'];

	m_entry: CommunityCompetitionEntry | null = null;
	competition: CommunityCompetition | null = null;
	votingCategories: CommunityCompetitionVotingCategory[] = [];
	userVotes: CommunityCompetitionEntryVote[] = [];
	isLoading = true;
	feed: ActivityFeedView | null = null;
	returnedFeedItems = 0;
	isParticipant = false;

	readonly Screen = Screen;
	readonly date = date;

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

		const feedPayload = await Api.sendRequest(
			`/web/posts/fetch/game/${this.m_entry.resource.id}`
		);
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				name: 'competition-entry-devlog',
				type: 'EventItem',
				url: `/web/posts/fetch/game/${this.m_entry.resource.id}`,
				slice: 3,
				hideGameInfo: true,
			},
			feedPayload.items,
			false
		);
		this.returnedFeedItems = feedPayload.items.length;

		this.isLoading = false;
	}

	copyShareUrl() {
		Clipboard.copy(this.m_entry!.permalink);
	}
}
