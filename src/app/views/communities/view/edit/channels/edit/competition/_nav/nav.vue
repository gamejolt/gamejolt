<script lang="ts" src="./nav"></script>

<template>
	<ul>
		<li>
			<router-link
				:to="{
					name: 'communities.view.edit.channels.competition.overview',
				}"
				active-class="active"
				exact
			>
				<app-jolticon icon="info-circle" />
				<translate>Overview</translate>
			</router-link>
		</li>
		<li>
			<router-link
				:to="{
					name: 'communities.view.edit.channels.competition.settings',
				}"
				active-class="active"
			>
				<app-jolticon icon="edit" />
				<translate>Edit</translate>
			</router-link>
		</li>
		<li>
			<router-link
				:to="{
					name: 'communities.view.edit.channels.competition.voting',
				}"
				active-class="active"
			>
				<app-jolticon icon="pedestals-numbers" />
				<translate>Voting</translate>
				&nbsp;
				<span v-if="competition.is_voting_enabled" class="tag tag-highlight">
					<translate>On</translate>
				</span>
				<span v-else class="tag">
					<translate>Off</translate>
				</span>
			</router-link>
		</li>
		<li>
			<router-link
				:to="{
					name: 'communities.view.edit.channels.competition.entries',
				}"
				active-class="active"
			>
				<app-jolticon icon="game" />
				<translate>Entries</translate>
				&nbsp;
				<span class="tag">
					{{ number(competition.entry_count) }}
				</span>
			</router-link>
		</li>
		<li v-if="canAssignAwards">
			<router-link
				:to="{
					name: 'communities.view.edit.channels.competition.assign-awards',
				}"
				active-class="active"
			>
				<app-jolticon icon="medal" />
				<translate>Assign Awards</translate>
			</router-link>
		</li>
	</ul>
</template>
