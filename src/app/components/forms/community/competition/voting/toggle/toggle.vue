<script lang="ts">
import { nextTick } from 'vue';
import { Emit, mixins, Options } from 'vue-property-decorator';
import { CommunityCompetition } from '../../../../../../../_common/community/competition/competition.model';
import AppFormControlToggle from '../../../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm } from '../../../../../../../_common/form-vue/form.service';

class Wrapper extends BaseForm<CommunityCompetition> {}

@Options({
	components: {
		AppFormControlToggle,
	},
})
export default class FormCommunityCompetitionVotingToggle extends mixins(Wrapper) {
	modelClass = CommunityCompetition;
	saveMethod = '$saveVotingEnabled' as const;

	@Emit('toggle-not-set-up')
	emitToggleNotSetUp() {}

	async onToggle() {
		if (!this.model!.isVotingSetUp) {
			this.emitToggleNotSetUp();
			// No change to the actual model should be counted.
			await nextTick();
			this.form.changed = false;
		} else {
			// Submit toggle.
			await this.form.submit();
		}
	}
}
</script>

<template>
	<app-form :controller="form">
		<app-form-group name="is_voting_enabled" hide-label>
			<p class="help-block">
				<span v-translate>
					This allows members of the community to judge games by rating them after the
					jam.<br />
					Enabling voting also lets you create and give out awards.
				</span>
			</p>

			<app-form-control-toggle :disabled="form.isProcessing" @changed="onToggle" />
		</app-form-group>
	</app-form>
</template>
