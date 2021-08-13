import { Inject, Options } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../../../../../utils/array';
import { Api } from '../../../../../../../../../_common/api/api.service';
import AppCardListAdd from '../../../../../../../../../_common/card/list/add/add.vue';
import AppCardListDraggable from '../../../../../../../../../_common/card/list/draggable/draggable.vue';
import AppCardListItem from '../../../../../../../../../_common/card/list/item/item.vue';
import AppCardList from '../../../../../../../../../_common/card/list/list.vue';
import { CommunityCompetitionAward } from '../../../../../../../../../_common/community/competition/award/award.model';
import {
	CompetitionPeriodPostComp,
	CompetitionPeriodVoting,
} from '../../../../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionVotingCategory } from '../../../../../../../../../_common/community/competition/voting-category/voting-category.model';
import { showErrorGrowl } from '../../../../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../../../_common/scroll/scroll.service';
import { AppTimeAgo } from '../../../../../../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../../../../../../_common/tooltip/tooltip-directive';
import AppCommunityCompetitionDate from '../../../../../../../../components/community/competition/date/date.vue';
import FormCommunityCompetitionAward from '../../../../../../../../components/forms/community/competition/award/award.vue';
import FormCommunityCompetitionVotingCategory from '../../../../../../../../components/forms/community/competition/voting/category/category.vue';
import FormCommunityCompetitionVotingEdit from '../../../../../../../../components/forms/community/competition/voting/edit/edit.vue';
import FormCommunityCompetitionVotingToggleTS from '../../../../../../../../components/forms/community/competition/voting/toggle/toggle';
import FormCommunityCompetitionVotingToggle from '../../../../../../../../components/forms/community/competition/voting/toggle/toggle.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../../../view.store';

@Options({
	name: 'RouteCommunitiesViewEditChannelsCompetitionVoting',
	components: {
		FormCommunityCompetitionVotingToggle,
		AppCommunityCompetitionDate,
		AppTimeAgo,
		AppCardList,
		AppCardListDraggable,
		AppCardListItem,
		AppCardListAdd,
		FormCommunityCompetitionVotingCategory,
		FormCommunityCompetitionAward,
		FormCommunityCompetitionVotingEdit,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: { params: ['id', 'channel'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			`/web/dash/communities/competitions/voting/${route.params.id}/${route.params.channel}`
		),
})
export default class RouteCommunitiesViewEditChannelsCompetitionVoting extends BaseRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	awards: CommunityCompetitionAward[] = [];
	activeAward: CommunityCompetitionAward | null = null;
	isShowingAwardAdd = false;
	votingCategories: CommunityCompetitionVotingCategory[] = [];
	activeVotingCategory: CommunityCompetitionVotingCategory | null = null;
	isShowingVotingCategoryAdd = false;
	isEditing = false;

	readonly CompetitionPeriodVoting = CompetitionPeriodVoting;

	declare $refs: {
		toggleForm: FormCommunityCompetitionVotingToggleTS;
	};

	get competition() {
		return this.routeStore.competition!;
	}

	get hasVotingCategories() {
		return this.votingCategories.length > 0;
	}

	get hasAwards() {
		return this.awards.length > 0;
	}

	get canToggleVoting() {
		return this.competition.periodNum < CompetitionPeriodVoting;
	}

	get canEditVoting() {
		return this.competition.periodNum < CompetitionPeriodPostComp;
	}

	get votingCategoriesEnabled() {
		return (
			this.competition.is_voting_enabled &&
			this.competition.has_community_voting &&
			this.competition.voting_type === 'categories'
		);
	}

	get canEditVotingCategories() {
		return this.competition.periodNum < CompetitionPeriodVoting && this.votingCategoriesEnabled;
	}

	get canEditAwards() {
		return this.competition.is_voting_enabled && this.competition.has_awards;
	}

	routeResolved($payload: any) {
		this.votingCategories = CommunityCompetitionVotingCategory.populate(
			$payload.votingCategories
		);
		this.awards = CommunityCompetitionAward.populate($payload.awards);
	}

	/**
	 * Gets called when voting gets toggled on/off, but has never been set up.
	 * In that case, instead of saving the toggle state, the form to set up
	 * voting for the first time will show (or hide on toggle off).
	 */
	onToggleNotSetUp() {
		this.isEditing = !this.isEditing;
	}

	onFormCancel() {
		this.isEditing = false;
		// Because the form was not submitted, reset voting to disabled when not initialized.
		if (!this.competition.isVotingSetUp) {
			this.$refs.toggleForm.setField('is_voting_enabled', false);
		}

		// Scroll to top of page, because the form got removed and would leave us with an almost
		// white space otherwise.
		Scroll.to(0);
	}

	onFormSubmit() {
		this.isEditing = false;

		// Scroll to top of page to show new voting information.
		Scroll.to(0);
	}

	onClickChange() {
		this.isEditing = true;
	}

	onCategoryAddSubmit($payload: any) {
		const category = new CommunityCompetitionVotingCategory($payload);
		this.votingCategories.push(category);
		this.isShowingVotingCategoryAdd = false;
	}

	async saveCategorySort(sortedCategories: CommunityCompetitionVotingCategory[]) {
		// Reorder the categories to see the result of the ordering right away.
		this.votingCategories.splice(0, this.votingCategories.length, ...sortedCategories);

		const sortedIds = sortedCategories.map(i => i.id);
		try {
			await CommunityCompetitionVotingCategory.$saveSort(this.competition.id, sortedIds);
		} catch (e) {
			console.error(e);
			showErrorGrowl(this.$gettext(`Could not save category arrangement.`));
		}
	}

	async onClickRemoveCategory(category: CommunityCompetitionVotingCategory) {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure want to remove this voting category?`)
		);

		if (result) {
			arrayRemove(this.votingCategories, i => i.id === category.id);
			await category.$remove();
		}
	}

	onAwardAddSubmit($payload: any) {
		const award = new CommunityCompetitionAward($payload);
		this.awards.push(award);
		this.isShowingAwardAdd = false;
	}

	async saveAwardSort(sortedAwards: CommunityCompetitionAward[]) {
		// Reorder the awards to see the result of the ordering right away.
		this.awards.splice(0, this.awards.length, ...sortedAwards);

		const sortedIds = sortedAwards.map(i => i.id);
		try {
			await CommunityCompetitionAward.$saveSort(this.competition.id, sortedIds);
		} catch (e) {
			console.error(e);
			showErrorGrowl(this.$gettext(`Could not save award arrangement.`));
		}
	}

	async onClickRemoveAward(award: CommunityCompetitionAward) {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure want to remove this award?`)
		);

		if (result) {
			arrayRemove(this.awards, i => i.id === award.id);
			await award.$remove();
		}
	}
}
