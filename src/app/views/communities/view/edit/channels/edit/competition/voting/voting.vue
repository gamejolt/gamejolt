<script lang="ts" src="./voting"></script>

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

						<app-card-list-draggable @change="saveCategorySort">
							<app-card-list-item
								v-for="category in votingCategories"
								:id="`category-container-${category.id}`"
								:key="category.id"
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

					<app-card-list-draggable @change="saveAwardSort">
						<app-card-list-item
							v-for="award in awards"
							:id="`award-container-${award.id}`"
							:key="award.id"
							:item="award"
						>
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
