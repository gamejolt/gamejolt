import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../../utils/array';
import { Api } from '../../../../../../_common/api/api.service';
import { CompetitionPeriodVoting } from '../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionEntrySubmitModal } from '../../../../../../_common/community/competition/entry/submit-modal/submit-modal.service';
import { CommunityCompetitionVotingCategory } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { number } from '../../../../../../_common/filters/number';
import { Growls } from '../../../../../../_common/growls/growls.service';
import AppIllustration from '../../../../../../_common/illustration/illustration.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../../../_common/store/app-store';
import AppCommunityCompetitionEntryGrid from '../../../../../components/community/competition/entry/grid/grid.vue';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	getChannelPathFromRoute,
	setCommunityMeta,
} from '../../view.store';

@Component({
	name: 'RouteCommunitiesViewChannelEntries',
	components: {
		AppIllustration,
		AppCommunityCompetitionEntryGrid,
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
export default class RouteCommunitiesViewChannelEntries extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	@AppState
	user!: AppStore['user'];

	readonly number = number;
	readonly Screen = Screen;

	isLoading = true;
	userEntries: CommunityCompetitionEntry[] = [];
	categories: CommunityCompetitionVotingCategory[] = [];

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
		return this.competition.period === 'running' && this.channel.visibility === 'published';
	}

	get hasSubmittedEntries() {
		return this.userEntries.length > 0;
	}

	get routeTitle() {
		return this.$gettextInterpolate(`%{ name } Entries`, {
			name: this.channel.displayTitle,
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

	async onClickSubmit() {
		const result = await CommunityCompetitionEntrySubmitModal.show(this.competition);
		if (result) {
			this.userEntries.unshift(result);

			Growls.success(this.$gettext(`Successfully submitted your entry to the jam!`));

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
