<script lang="ts" src="./assign-awards"></script>

<template>
	<div>
		<h2 class="sans-margin-top"><translate>Assign Awards</translate></h2>

		<template v-if="isLoading">
			<app-loading centered />
		</template>

		<template v-else-if="awards.length === 0">
			<div class="alert">
				<p>
					<translate>
						You have created no awards for this jam yet. Go over to the Voting section
						to create awards.
					</translate>
				</p>
				<app-button
					icon="edit"
					:to="{ name: 'communities.view.edit.channels.competition.voting' }"
				>
					<translate>Create Awards</translate>
				</app-button>
			</div>
		</template>

		<template v-else>
			<p v-if="noAwardSelected">
				<translate>
					These are the awards you've created. Select an award below to choose which
					entries to give it to.
				</translate>
			</p>

			<div class="-award-list">
				<app-button
					v-for="award of awards"
					:key="award.id"
					class="-award"
					:solid="isAwardSelected(award)"
					:primary="isAwardSelected(award)"
					icon="medal"
					:to="{
						name: 'communities.view.edit.channels.competition.assign-awards.award',
						params: { awardId: award.id },
					}"
					:badge="(award.entry_count || 0).toString()"
				>
					{{ award.name }}
				</app-button>
			</div>

			<router-view @assign="onAssignAward($event)" @unassign="onUnassignAward($event)" />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-award-list
	display: flex
	flex-wrap: wrap

.-award
	margin-right: 16px
	margin-bottom: 16px
</style>
