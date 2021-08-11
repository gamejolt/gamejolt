import { Inject, Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { CommunityCompetitionVotingCategory } from '../../../../../../../../../_common/community/competition/voting-category/voting-category.model';
import { Environment } from '../../../../../../../../../_common/environment/environment.service';
import { duration } from '../../../../../../../../../_common/filters/duration';
import { Growls } from '../../../../../../../../../_common/growls/growls.service';
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
	readonly duration = duration;

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

			Growls.success(this.$gettext(`Your jam has been published!`));
		}
	}
}
