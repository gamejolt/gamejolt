<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListDraggable from '../../../../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../../../../_common/card/list/AppCardListItem.vue';
import {
	$removeCommunityCompetitionAward,
	$saveCommunityCompetitionAwardSort,
	CommunityCompetitionAwardModel,
} from '../../../../../../../../../_common/community/competition/award/award.model';
import {
	CompetitionPeriodPostComp,
	CompetitionPeriodVoting,
} from '../../../../../../../../../_common/community/competition/competition.model';
import {
	$removeCommunityCompetitionVotingCategory,
	CommunityCompetitionVotingCategoryModel,
} from '../../../../../../../../../_common/community/competition/voting-category/voting-category.model';
import { showErrorGrowl } from '../../../../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../../_common/route/legacy-route-component';
import { Scroll } from '../../../../../../../../../_common/scroll/scroll.service';
import AppTimeAgo from '../../../../../../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../../../../../../_common/tooltip/tooltip-directive';
import { arrayRemove } from '../../../../../../../../../utils/array';
import AppCommunityCompetitionDate from '../../../../../../../../components/community/competition/date/AppCommunityCompetitionDate.vue';
import FormCommunityCompetitionAward from '../../../../../../../../components/forms/community/competition/award/award.vue';
import FormCommunityCompetitionVotingCategory from '../../../../../../../../components/forms/community/competition/voting/category/category.vue';
import FormCommunityCompetitionVotingEdit from '../../../../../../../../components/forms/community/competition/voting/edit/edit.vue';
import FormCommunityCompetitionVotingToggleTS from '../../../../../../../../components/forms/community/competition/voting/toggle/toggle';
import FormCommunityCompetitionVotingToggle from '../../../../../../../../components/forms/community/competition/voting/toggle/toggle.vue';
import { useCommunityRouteStore } from '../../../../../view.store';

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
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	deps: { params: ['id', 'channel'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			`/web/dash/communities/competitions/voting/${route.params.id}/${route.params.channel}`
		),
})
export default class RouteCommunitiesViewEditChannelsCompetitionVoting extends LegacyRouteComponent {
	routeStore = setup(() => useCommunityRouteStore())!;

	awards: CommunityCompetitionAwardModel[] = [];
	activeAward: CommunityCompetitionAwardModel | null = null;
	isShowingAwardAdd = false;
	votingCategories: CommunityCompetitionVotingCategoryModel[] = [];
	activeVotingCategory: CommunityCompetitionVotingCategoryModel | null = null;
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
		this.votingCategories = CommunityCompetitionVotingCategoryModel.populate(
			$payload.votingCategories
		);
		this.awards = CommunityCompetitionAwardModel.populate($payload.awards);
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
		const category = new CommunityCompetitionVotingCategoryModel($payload);
		this.votingCategories.push(category);
		this.isShowingVotingCategoryAdd = false;
	}

	async saveCategorySort(sortedCategories: CommunityCompetitionVotingCategoryModel[]) {
		// Reorder the categories to see the result of the ordering right away.
		this.votingCategories.splice(0, this.votingCategories.length, ...sortedCategories);

		const sortedIds = sortedCategories.map(i => i.id);
		try {
			await Api.sendRequest(
				`/web/dash/communities/competitions/voting-categories/save-sort/${this.competition.id}`,
				sortedIds
			);
		} catch (e) {
			console.error(e);
			showErrorGrowl(this.$gettext(`Could not save category arrangement.`));
		}
	}

	async onClickRemoveCategory(category: CommunityCompetitionVotingCategoryModel) {
		const result = await showModalConfirm(
			this.$gettext(`Are you sure want to remove this voting category?`)
		);

		if (result) {
			arrayRemove(this.votingCategories, i => i.id === category.id);
			await $removeCommunityCompetitionVotingCategory(category);
		}
	}

	onAwardAddSubmit($payload: any) {
		const award = new CommunityCompetitionAwardModel($payload);
		this.awards.push(award);
		this.isShowingAwardAdd = false;
	}

	async saveAwardSort(sortedAwards: CommunityCompetitionAwardModel[]) {
		// Reorder the awards to see the result of the ordering right away.
		this.awards.splice(0, this.awards.length, ...sortedAwards);

		const sortedIds = sortedAwards.map(i => i.id);
		try {
			await $saveCommunityCompetitionAwardSort(this.competition.id, sortedIds);
		} catch (e) {
			console.error(e);
			showErrorGrowl(this.$gettext(`Could not save award arrangement.`));
		}
	}

	async onClickRemoveAward(award: CommunityCompetitionAwardModel) {
		const result = await showModalConfirm(
			this.$gettext(`Are you sure want to remove this award?`)
		);

		if (result) {
			arrayRemove(this.awards, i => i.id === award.id);
			await $removeCommunityCompetitionAward(award);
		}
	}
}
</script>

<template>
	<div>
		<h2 class="sans-margin-top">
			<AppTranslate>Voting</AppTranslate>
		</h2>

		<FormCommunityCompetitionVotingToggle
			v-if="canToggleVoting"
			ref="toggleForm"
			:model="competition"
			@toggle-not-set-up="onToggleNotSetUp"
		/>

		<div v-else-if="!competition.is_voting_enabled" class="alert">
			<p>
				<AppTranslate>
					Voting is disabled. Because the jam is already over, it cannot be enabled.
				</AppTranslate>
			</p>
		</div>

		<template v-if="isEditing">
			<FormCommunityCompetitionVotingEdit
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
							<AppTranslate>Voting end date</AppTranslate>
						</th>
						<td>
							<AppCommunityCompetitionDate
								:date="competition.voting_ends_on"
								:timezone="competition.timezone"
							/>
							<span class="help-inline">
								<template v-if="competition.periodNum <= CompetitionPeriodVoting">
									(<AppTranslate>in</AppTranslate>
									<AppTimeAgo
										without-suffix
										is-future
										:date="competition.voting_ends_on"
									/>)
								</template>
								<template v-else>
									(<AppTimeAgo :date="competition.voting_ends_on" />)
								</template>
							</span>
						</td>
					</tr>
					<tr>
						<th>
							<AppTranslate>Community voting?</AppTranslate>
						</th>
						<td>
							<span v-if="competition.has_community_voting" class="tag tag-highlight">
								<AppTranslate>On</AppTranslate>
							</span>
							<span v-else class="tag">
								<AppTranslate>Off</AppTranslate>
							</span>
						</td>
					</tr>
					<template v-if="competition.has_community_voting">
						<tr>
							<th>
								<AppTranslate>Who can vote?</AppTranslate>
							</th>
							<td>
								<template v-if="competition.voting_user_restriction === 'users'">
									<AppTranslate>Any Game Jolt user</AppTranslate>
								</template>
								<template v-else>
									<AppTranslate>Only jam participants</AppTranslate>
								</template>
							</td>
						</tr>
						<tr>
							<th>
								<AppTranslate>Voting type</AppTranslate>
							</th>
							<td>
								<template v-if="competition.voting_type === 'overall'">
									<AppTranslate>Overall</AppTranslate>
								</template>
								<template v-else>
									<AppTranslate>Categories</AppTranslate>
								</template>
							</td>
						</tr>
					</template>
					<tr>
						<th>
							<AppTranslate>Awards?</AppTranslate>
						</th>
						<td>
							<span v-if="competition.has_awards" class="tag tag-highlight">
								<AppTranslate>On</AppTranslate>
							</span>
							<span v-else class="tag">
								<AppTranslate>Off</AppTranslate>
							</span>
						</td>
					</tr>
				</tbody>
			</table>

			<AppButton v-if="canEditVoting" icon="edit" @click="onClickChange">
				<AppTranslate>Change</AppTranslate>
			</AppButton>

			<template v-if="votingCategoriesEnabled">
				<h3>
					<AppTranslate>Voting Categories</AppTranslate>
				</h3>

				<p class="help-block">
					<AppTranslate>
						These are the categories on which users can vote. Voters can give entries a
						rating in each category you create. You can only edit categories before
						voting starts.
					</AppTranslate>
				</p>
				<p class="help-block">
					<AppTranslate>
						Entries are ranked within each category and assigned an overall rank based
						on their category ratings.
					</AppTranslate>
				</p>

				<template v-if="canEditVotingCategories">
					<div v-if="!hasVotingCategories" class="alert alert-notice">
						<AppTranslate>You must add categories before voting starts.</AppTranslate>
					</div>

					<AppCardList
						:items="votingCategories"
						:active-item="activeVotingCategory"
						:is-adding="isShowingVotingCategoryAdd"
						is-draggable
						@activate="activeVotingCategory = $event"
					>
						<AppCardListAdd
							:label="$gettext(`Add Category`)"
							@toggle="isShowingVotingCategoryAdd = !isShowingVotingCategoryAdd"
						>
							<FormCommunityCompetitionVotingCategory
								:competition="competition"
								@submit="onCategoryAddSubmit"
							/>
						</AppCardListAdd>

						<AppCardListDraggable item-key="id" @change="saveCategorySort">
							<template #item="{ element: category }">
								<AppCardListItem
									:id="`category-container-${category.id}`"
									:item="category"
								>
									<a
										v-app-tooltip="$gettext(`Remove Category`)"
										class="card-remove"
										@click.stop="onClickRemoveCategory(category)"
									>
										<AppJolticon icon="remove" />
									</a>

									<div>
										{{ category.name }}
									</div>
									<div v-if="category.description">
										<small class="text-muted">{{ category.description }}</small>
									</div>

									<template #body>
										<FormCommunityCompetitionVotingCategory
											:competition="competition"
											:model="category"
										/>
									</template>
								</AppCardListItem>
							</template>
						</AppCardListDraggable>
					</AppCardList>
				</template>

				<template v-else>
					<div v-if="!hasVotingCategories" class="alert alert-notice">
						<AppTranslate>
							No voting categories were added before voting began. Because of this,
							users cannot vote on entries.
						</AppTranslate>
					</div>
					<template v-else>
						<AppCardList :items="votingCategories">
							<AppCardListItem
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
							</AppCardListItem>
						</AppCardList>
					</template>
				</template>
			</template>

			<template v-if="canEditAwards">
				<h3>
					<AppTranslate>Awards</AppTranslate>
				</h3>

				<p class="help-block">
					<AppTranslate>
						These are the awards that can be assigned to entries. Awards can be added
						and assigned at any time, but we recommend assigning them during the voting
						period.
					</AppTranslate>
				</p>
				<p class="help-block">
					<AppTranslate>
						Award-winning entries are displayed by default at the top of the Games page
						based on the order they appear below.
					</AppTranslate>
				</p>

				<div v-if="!hasAwards" class="alert alert-notice">
					<AppTranslate>
						You must add awards before you can assign them to entries.
					</AppTranslate>
				</div>

				<AppCardList
					:items="awards"
					:active-item="activeAward"
					:is-adding="isShowingAwardAdd"
					is-draggable
					@activate="activeAward = $event"
				>
					<AppCardListAdd
						:label="$gettext(`Add Award`)"
						@toggle="isShowingAwardAdd = !isShowingAwardAdd"
					>
						<FormCommunityCompetitionAward
							:competition="competition"
							@submit="onAwardAddSubmit"
						/>
					</AppCardListAdd>

					<AppCardListDraggable item-key="id" @change="saveAwardSort">
						<template #item="{ element: award }">
							<AppCardListItem :id="`award-container-${award.id}`" :item="award">
								<a
									v-app-tooltip="$gettext(`Remove Award`)"
									class="card-remove"
									@click.stop="onClickRemoveAward(award)"
								>
									<AppJolticon icon="remove" />
								</a>

								<div>
									{{ award.name }}
								</div>
								<div v-if="award.description">
									<small class="text-muted">{{ award.description }}</small>
								</div>

								<template #body>
									<FormCommunityCompetitionAward
										:competition="competition"
										:model="award"
									/>
								</template>
							</AppCardListItem>
						</template>
					</AppCardListDraggable>
				</AppCardList>
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
