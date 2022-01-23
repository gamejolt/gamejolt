<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../../../../../utils/array';
import { Api } from '../../../../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListDraggable from '../../../../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../../../../_common/card/list/AppCardListItem.vue';
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
		AppCardListItem,
		AppCardListAdd,
		FormCommunityCompetitionVotingCategory,
		FormCommunityCompetitionAward,
		FormCommunityCompetitionVotingEdit,
		AppCardListDraggable,
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
</script>

<template>
	<div>
		<h2 class="sans-margin-top">
			<translate>Voting</translate>
		</h2>

		<form-community-competition-voting-toggle
			v-if="canToggleVoting"
			ref="toggleForm"
			:model="competition"
			@toggle-not-set-up="onToggleNotSetUp"
		/>

		<div v-else-if="!competition.is_voting_enabled" class="alert">
			<p>
				<translate>
					Voting is disabled. Because the jam is already over, it cannot be enabled.
				</translate>
			</p>
		</div>

		<template v-if="isEditing">
			<form-community-competition-voting-edit
				:model="competition"
				@cancel="onFormCancel"
				@submit="onFormSubmit"
			/>
		</template>

		<template v-else-if="competition.is_voting_enabled">
			<table class="table">
				<tbody>
					<tr>
						<th>
							<translate>Voting end date</translate>
						</th>
						<td>
							<app-community-competition-date
								:date="competition.voting_ends_on"
								:timezone="competition.timezone"
							/>
							<span class="help-inline">
								<template v-if="competition.periodNum <= CompetitionPeriodVoting">
									(<translate>in</translate>
									<app-time-ago
										without-suffix
										is-future
										:date="competition.voting_ends_on"
									/>)
								</template>
								<template v-else>
									(<app-time-ago :date="competition.voting_ends_on" />)
								</template>
							</span>
						</td>
					</tr>
					<tr>
						<th>
							<translate>Community voting?</translate>
						</th>
						<td>
							<span v-if="competition.has_community_voting" class="tag tag-highlight">
								<translate>On</translate>
							</span>
							<span v-else class="tag">
								<translate>Off</translate>
							</span>
						</td>
					</tr>
					<template v-if="competition.has_community_voting">
						<tr>
							<th>
								<translate>Who can vote?</translate>
							</th>
							<td>
								<template v-if="competition.voting_user_restriction === 'users'">
									<translate>Any Game Jolt user</translate>
								</template>
								<template v-else>
									<translate>Only jam participants</translate>
								</template>
							</td>
						</tr>
						<tr>
							<th>
								<translate>Voting type</translate>
							</th>
							<td>
								<template v-if="competition.voting_type === 'overall'">
									<translate>Overall</translate>
								</template>
								<template v-else>
									<translate>Categories</translate>
								</template>
							</td>
						</tr>
					</template>
					<tr>
						<th>
							<translate>Awards?</translate>
						</th>
						<td>
							<span v-if="competition.has_awards" class="tag tag-highlight">
								<translate>On</translate>
							</span>
							<span v-else class="tag">
								<translate>Off</translate>
							</span>
						</td>
					</tr>
				</tbody>
			</table>

			<app-button v-if="canEditVoting" icon="edit" @click="onClickChange">
				<translate>Change</translate>
			</app-button>

			<template v-if="votingCategoriesEnabled">
				<h3>
					<translate>Voting Categories</translate>
				</h3>

				<p class="help-block">
					<translate>
						These are the categories on which users can vote. Voters can give entries a
						rating in each category you create. You can only edit categories before
						voting starts.
					</translate>
				</p>
				<p class="help-block">
					<translate>
						Entries are ranked within each category and assigned an overall rank based
						on their category ratings.
					</translate>
				</p>

				<template v-if="canEditVotingCategories">
					<div v-if="!hasVotingCategories" class="alert alert-notice">
						<translate>You must add categories before voting starts.</translate>
					</div>

					<app-card-list
						:items="votingCategories"
						:active-item="activeVotingCategory"
						:is-adding="isShowingVotingCategoryAdd"
						is-draggable
						@activate="activeVotingCategory = $event"
					>
						<app-card-list-add
							:label="$gettext(`Add Category`)"
							@toggle="isShowingVotingCategoryAdd = !isShowingVotingCategoryAdd"
						>
							<form-community-competition-voting-category
								:competition="competition"
								@submit="onCategoryAddSubmit"
							/>
						</app-card-list-add>

						<app-card-list-draggable item-key="id" @change="saveCategorySort">
							<template #item="{ element: category }">
								<app-card-list-item
									:id="`category-container-${category.id}`"
									:item="category"
								>
									<a
										v-app-tooltip="$gettext(`Remove Category`)"
										class="card-remove"
										@click.stop="onClickRemoveCategory(category)"
									>
										<app-jolticon icon="remove" />
									</a>

									<div>
										{{ category.name }}
									</div>
									<div v-if="category.description">
										<small class="text-muted">{{ category.description }}</small>
									</div>

									<template #body>
										<form-community-competition-voting-category
											:competition="competition"
											:model="category"
										/>
									</template>
								</app-card-list-item>
							</template>
						</app-card-list-draggable>
					</app-card-list>
				</template>

				<template v-else>
					<div v-if="!hasVotingCategories" class="alert alert-notice">
						<translate>
							No voting categories were added before voting began. Because of this,
							users cannot vote on entries.
						</translate>
					</div>
					<template v-else>
						<app-card-list :items="votingCategories">
							<app-card-list-item
								v-for="category in votingCategories"
								:id="`category-container-${category.id}`"
								:key="category.id"
								:item="category"
							>
								<div>
									{{ category.name }}
								</div>
								<div v-if="category.description">
									<small class="text-muted">{{ category.description }}</small>
								</div>
							</app-card-list-item>
						</app-card-list>
					</template>
				</template>
			</template>

			<template v-if="canEditAwards">
				<h3>
					<translate>Awards</translate>
				</h3>

				<p class="help-block">
					<translate>
						These are the awards that can be assigned to entries. Awards can be added
						and assigned at any time, but we recommend assigning them during the voting
						period.
					</translate>
				</p>
				<p class="help-block">
					<translate>
						Award-winning entries are displayed by default at the top of the Games page
						based on the order they appear below.
					</translate>
				</p>

				<div v-if="!hasAwards" class="alert alert-notice">
					<translate>
						You must add awards before you can assign them to entries.
					</translate>
				</div>

				<app-card-list
					:items="awards"
					:active-item="activeAward"
					:is-adding="isShowingAwardAdd"
					is-draggable
					@activate="activeAward = $event"
				>
					<app-card-list-add
						:label="$gettext(`Add Award`)"
						@toggle="isShowingAwardAdd = !isShowingAwardAdd"
					>
						<form-community-competition-award
							:competition="competition"
							@submit="onAwardAddSubmit"
						/>
					</app-card-list-add>

					<app-card-list-draggable item-key="id" @change="saveAwardSort">
						<template #item="{ element: award }">
							<app-card-list-item :id="`award-container-${award.id}`" :item="award">
								<a
									v-app-tooltip="$gettext(`Remove Award`)"
									class="card-remove"
									@click.stop="onClickRemoveAward(award)"
								>
									<app-jolticon icon="remove" />
								</a>

								<div>
									{{ award.name }}
								</div>
								<div v-if="award.description">
									<small class="text-muted">{{ award.description }}</small>
								</div>

								<template #body>
									<form-community-competition-award
										:competition="competition"
										:model="award"
									/>
								</template>
							</app-card-list-item>
						</template>
					</app-card-list-draggable>
				</app-card-list>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-category-controls
	display: flex
	justify-content: flex-end
	margin-bottom: $line-height-computed
</style>
