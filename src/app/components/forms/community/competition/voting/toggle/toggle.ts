import { nextTick } from 'vue';
import { Emit, Options } from 'vue-property-decorator';
import { CommunityCompetition } from '../../../../../../../_common/community/competition/competition.model';
import AppFormControlToggle from '../../../../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm } from '../../../../../../../_common/form-vue/form.service';

@Options({
	components: {
		AppFormControlToggle,
	},
})
export default class FormCommunityCompetitionVotingToggle extends BaseForm<CommunityCompetition> {
	modelClass = CommunityCompetition;
	saveMethod: '$saveVotingEnabled' = '$saveVotingEnabled';

	@Emit('toggle-not-set-up')
	emitToggleNotSetUp() {}

	async onToggle() {
		if (!this.model!.isVotingSetUp) {
			this.emitToggleNotSetUp();
			// No change to the actual model should be counted.
			await nextTick();
			this.changed = false;
		} else {
			// Submit toggle.
			await this._onSubmit();
		}
	}
}
