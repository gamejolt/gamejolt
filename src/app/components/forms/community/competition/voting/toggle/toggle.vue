<script lang="ts" src="./toggle"></script>

<template>
	<app-form name="communityCompetitionVotingToggleForm">
		<app-form-group name="is_voting_enabled" hide-label>
			<p class="help-block">
				<span v-translate>
					This allows members of the community to judge games by rating them after the
					jam.<br />
					Enabling voting also lets you create and give out awards.
				</span>
			</p>

			<app-form-control-toggle :disabled="state.isProcessing" @changed="onToggle" />
		</app-form-group>
	</app-form>
</template>
