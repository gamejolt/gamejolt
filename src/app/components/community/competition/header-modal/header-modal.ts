import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { CommunityCompetition } from '../../../../../_common/community/competition/competition.model';
import { BaseModal } from '../../../../../_common/modal/base';
import FormCommunityCompetitionHeader from '../../../forms/community/competition/header/header.vue';

@Component({
	components: {
		FormCommunityCompetitionHeader,
	},
})
export default class AppCommunityCompetitionHeaderModal extends BaseModal {
	@Prop(propRequired(CommunityCompetition)) competition!: CommunityCompetition;

	// We don't want to close the modal after they've uploaded a header since they can set a crop
	// after. We want to auto-close it after they've saved the crop, though.
	previousHeaderId: number | null = null;

	created() {
		if (this.competition.header) {
			this.previousHeaderId = this.competition.header.id;
		}
	}

	onSubmit(competition: CommunityCompetition) {
		const newHeaderId = (competition.header && competition.header.id) || null;
		if (this.previousHeaderId === newHeaderId) {
			this.modal.resolve(this.competition);
		}
		this.previousHeaderId = newHeaderId;
	}
}
