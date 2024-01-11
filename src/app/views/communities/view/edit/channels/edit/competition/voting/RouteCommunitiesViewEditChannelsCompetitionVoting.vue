<script lang="ts">
import { computed, ref, toRef } from 'vue';
import { Api } from '../../../../../../../../../_common/api/api.service';
import AppButton from '../../../../../../../../../_common/button/AppButton.vue';
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
import AppJolticon from '../../../../../../../../../_common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../../../_common/scroll/scroll.service';
import AppTimeAgo from '../../../../../../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../../../../_common/translate/translate.service';
import { arrayRemove } from '../../../../../../../../../utils/array';
import AppCommunityCompetitionDate from '../../../../../../../../components/community/competition/date/AppCommunityCompetitionDate.vue';
import FormCommunityCompetitionAward from '../../../../../../../../components/forms/community/competition/award/FormCommunityCompetitionAward.vue';
import FormCommunityCompetitionVotingCategory from '../../../../../../../../components/forms/community/competition/voting/category/category.vue';
import FormCommunityCompetitionVotingEdit from '../../../../../../../../components/forms/community/competition/voting/edit/edit.vue';
import FormCommunityCompetitionVotingToggle from '../../../../../../../../components/forms/community/competition/voting/toggle/toggle.vue';
import { useCommunityRouteStore } from '../../../../../view.store';

export default {
	...defineAppRouteOptions({
		deps: { params: ['id', 'channel'] },
		resolver: ({ route }) =>
			Api.sendRequest(
				`/web/dash/communities/competitions/voting/${route.params.id}/${route.params.channel}`
			),
	}),
};
</script>

<script lang="ts" setup>
const { competition } = useCommunityRouteStore()!;

const awards = ref<CommunityCompetitionAwardModel[]>([]);
const votingCategories = ref<CommunityCompetitionVotingCategoryModel[]>([]);
const activeAward = ref<CommunityCompetitionAwardModel>();
const activeVotingCategory = ref<CommunityCompetitionVotingCategoryModel | undefined>(undefined);
const isShowingAwardAdd = ref(false);
const isShowingVotingCategoryAdd = ref(false);
const isEditing = ref(false);
const toggleForm = ref<FormCommunityCompetitionVotingToggle>();

const hasVotingCategories = toRef(() => votingCategories.value.length > 0);
const hasAwards = toRef(() => awards.value.length > 0);
const canToggleVoting = toRef(() => competition.value!.periodNum < CompetitionPeriodVoting);
const canEditVoting = toRef(() => competition.value!.periodNum < CompetitionPeriodPostComp);
const canEditAwards = toRef(
	() => competition.value!.is_voting_enabled && competition.value!.has_awards
);
const canEditVotingCategories = toRef(
	() => competition.value!.periodNum < CompetitionPeriodVoting && votingCategoriesEnabled.value
);

const votingCategoriesEnabled = computed(
	() =>
		competition.value!.is_voting_enabled &&
		competition.value!.has_community_voting &&
		competition.value!.voting_type === 'categories'
);
/**
 * Gets called when voting gets toggled on/off, but has never been set up.
 * In that case, instead of saving the toggle state, the form to set up
 * voting for the first time will show (or hide on toggle off).
 */
function onToggleNotSetUp() {
	isEditing.value = !isEditing.value;
}

function onFormCancel() {
	isEditing.value = false;
	// Because the form was not submitted, reset voting to disabled when not initialized.
	if (toggleForm.value && !competition.value!.isVotingSetUp) {
		toggleForm.value.setField('is_voting_enabled', false);
	}

	// Scroll to top of page, because the form got removed and would leave us with an almost
	// white space otherwise.
	Scroll.to(0);
}

function onFormSubmit() {
	isEditing.value = false;

	// Scroll to top of page to show new voting information.
	Scroll.to(0);
}

function onClickChange() {
	isEditing.value = true;
}

function onCategoryAddSubmit($payload: any) {
	const category = new CommunityCompetitionVotingCategoryModel($payload);
	votingCategories.value.push(category);
	isShowingVotingCategoryAdd.value = false;
}

async function saveCategorySort(sortedCategories: CommunityCompetitionVotingCategoryModel[]) {
	// Reorder the categories to see the result of the ordering right away.
	votingCategories.value.splice(0, votingCategories.value.length, ...sortedCategories);

	const sortedIds = sortedCategories.map(i => i.id);
	try {
		await Api.sendRequest(
			`/web/dash/communities/competitions/voting-categories/save-sort/${
				competition.value!.id
			}`,
			sortedIds
		);
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Could not save category arrangement.`));
	}
}

async function onClickRemoveCategory(category: CommunityCompetitionVotingCategoryModel) {
	const result = await showModalConfirm(
		$gettext(`Are you sure want to remove this voting category?`)
	);

	if (result) {
		arrayRemove(votingCategories.value, i => i.id === category.id);
		await $removeCommunityCompetitionVotingCategory(category);
	}
}

function onAwardAddSubmit($payload: any) {
	const award = new CommunityCompetitionAwardModel($payload);
	awards.value.push(award);
	isShowingAwardAdd.value = false;
}

async function saveAwardSort(sortedAwards: CommunityCompetitionAwardModel[]) {
	// Reorder the awards to see the result of the ordering right away.
	awards.value.splice(0, awards.value.length, ...sortedAwards);

	const sortedIds = sortedAwards.map(i => i.id);
	try {
		await $saveCommunityCompetitionAwardSort(competition.value!.id, sortedIds);
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Could not save award arrangement.`));
	}
}

async function onClickRemoveAward(award: CommunityCompetitionAwardModel) {
	const result = await showModalConfirm($gettext(`Are you sure want to remove this award?`));

	if (result) {
		arrayRemove(awards.value, i => i.id === award.id);
		await $removeCommunityCompetitionAward(award);
	}
}
createAppRoute({
	onResolved({ payload }) {
		votingCategories.value = CommunityCompetitionVotingCategoryModel.populate(
			payload.votingCategories
		);
		awards.value = CommunityCompetitionAwardModel.populate(payload.awards);
	},
});
</script>

<template>
	<div>
		<h2 class="sans-margin-top">
			{{ $gettext(`Voting`) }}
		</h2>

		<FormCommunityCompetitionVotingToggle
			v-if="canToggleVoting"
			ref="toggleForm"
			:model="competition!"
			@toggle-not-set-up="onToggleNotSetUp"
		/>

		<div v-else-if="!competition!.is_voting_enabled" class="alert">
			<p>
				{{
					$gettext(
						`Voting is disabled. Because the jam is already over, it cannot be enabled.`
					)
				}}
			</p>
		</div>

		<template v-if="isEditing">
			<FormCommunityCompetitionVotingEdit
				:model="competition!"
				@cancel="onFormCancel"
				@submit="onFormSubmit"
			/>
		</template>

		<template v-else-if="competition!.is_voting_enabled">
			<table class="table">
				<tbody>
					<tr>
						<th>
							{{ $gettext(`Voting end date`) }}
						</th>
						<td>
							<AppCommunityCompetitionDate
								:date="competition!.voting_ends_on"
								:timezone="competition!.timezone"
							/>
							<span class="help-inline">
								<template v-if="competition!.periodNum <= CompetitionPeriodVoting">
									({{ $gettext(`in`) }}
									<AppTimeAgo
										without-suffix
										is-future
										:date="competition!.voting_ends_on"
									/>)
								</template>
								<template v-else>
									(<AppTimeAgo :date="competition!.voting_ends_on" />)
								</template>
							</span>
						</td>
					</tr>
					<tr>
						<th>
							{{ $gettext(`Community voting?`) }}
						</th>
						<td>
							<span
								v-if="competition!.has_community_voting"
								class="tag tag-highlight"
							>
								{{ $gettext(`On`) }}
							</span>
							<span v-else class="tag">
								{{ $gettext(`Off`) }}
							</span>
						</td>
					</tr>
					<template v-if="competition!.has_community_voting">
						<tr>
							<th>
								{{ $gettext(`Who can vote?`) }}
							</th>
							<td>
								<template v-if="competition!.voting_user_restriction === 'users'">
									{{ $gettext(`Any Game Jolt user`) }}
								</template>
								<template v-else>
									{{ $gettext(`Only jam participants`) }}
								</template>
							</td>
						</tr>
						<tr>
							<th>
								{{ $gettext(`Voting type`) }}
							</th>
							<td>
								<template v-if="competition!.voting_type === 'overall'">
									{{ $gettext(`Overall`) }}
								</template>
								<template v-else>
									{{ $gettext(`Categories`) }}
								</template>
							</td>
						</tr>
					</template>
					<tr>
						<th>
							{{ $gettext(`Awards?`) }}
						</th>
						<td>
							<span v-if="competition!.has_awards" class="tag tag-highlight">
								{{ $gettext(`On`) }}
							</span>
							<span v-else class="tag">
								{{ $gettext(`Off`) }}
							</span>
						</td>
					</tr>
				</tbody>
			</table>

			<AppButton v-if="canEditVoting" icon="edit" @click="onClickChange">
				{{ $gettext(`Change`) }}
			</AppButton>

			<template v-if="votingCategoriesEnabled">
				<h3>
					{{ $gettext(`Voting Categories`) }}
				</h3>

				<p class="help-block">
					{{
						$gettext(
							`These are the categories on which users can vote. Voters can give entries a rating in each category you create. You can only edit categories before voting starts.`
						)
					}}
				</p>
				<p class="help-block">
					{{
						$gettext(
							`Entries are ranked within each category and assigned an overall rank based on their category ratings.`
						)
					}}
				</p>

				<template v-if="canEditVotingCategories">
					<div v-if="!hasVotingCategories" class="alert alert-notice">
						{{ $gettext(`You must add categories before voting starts.`) }}
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
								:competition="competition!"
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
											:competition="competition!"
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
						{{
							$gettext(
								`No voting categories were added before voting began. Because of this, users cannot vote on entries.`
							)
						}}
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
					{{ $gettext(`Awards`) }}
				</h3>

				<p class="help-block">
					{{
						$gettext(
							`These are the awards that can be assigned to entries. Awards can be added and assigned at any time, but we recommend assigning them during the voting period.`
						)
					}}
				</p>
				<p class="help-block">
					{{
						$gettext(
							`Award-winning entries are displayed by default at the top of the Games page based on the order they appear below.`
						)
					}}
				</p>

				<div v-if="!hasAwards" class="alert alert-notice">
					{{ $gettext(`You must add awards before you can assign them to entries.`) }}
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
							:competition="competition!"
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
										:competition="competition!"
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
