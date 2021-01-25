import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../../../../utils/vue';
import { Api } from '../../../../../../_common/api/api.service';
import { CommunityCompetition } from '../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionVotingCategory } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { date } from '../../../../../../_common/filters/date';
import AppGameThumbnailImg from '../../../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import AppLoading from '../../../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../../../_common/modal/base';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { AppTimeAgo } from '../../../../../../_common/time/ago/ago';
import AppUserCardHover from '../../../../../../_common/user/card/hover/hover.vue';
import AppUserAvatar from '../../../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../../../_common/user/verified-tick/verified-tick.vue';
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
	},
	filters: {
		date,
	},
})
export default class AppCommunityCompetitionEntryModal extends BaseModal {
	@Prop(propOptional(CommunityCompetitionEntry)) entry?: CommunityCompetitionEntry;
	@Prop(propOptional(Number)) entryId?: number;

	m_entry: CommunityCompetitionEntry | null = null;
	competition: CommunityCompetition | null = null;
	votingCategories: CommunityCompetitionVotingCategory[] = [];
	isLoading = true;

	readonly Screen = Screen;

	get title() {
		return this.m_entry ? this.m_entry.resource.title : this.$gettext(`Loading...`);
	}

	get author() {
		return this.m_entry!.author;
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

		this.isLoading = false;
	}
}
