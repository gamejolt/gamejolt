<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityCompetitionModel } from '../../../../../_common/community/competition/competition.model';
import { BaseModal } from '../../../../../_common/modal/base';
import FormCommunityCompetitionHeader from '../../../forms/community/competition/header/header.vue';

@Options({
	components: {
		FormCommunityCompetitionHeader,
	},
})
export default class AppCommunityCompetitionHeaderModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) competition!: CommunityCompetitionModel;

	// We don't want to close the modal after they've uploaded a header since they can set a crop
	// after. We want to auto-close it after they've saved the crop, though.
	previousHeaderId: number | null = null;

	created() {
		if (this.competition.header) {
			this.previousHeaderId = this.competition.header.id;
		}
	}

	onSubmit(competition: CommunityCompetitionModel) {
		const newHeaderId = (competition.header && competition.header.id) || null;
		if (this.previousHeaderId === newHeaderId) {
			this.modal.resolve(this.competition);
		}
		this.previousHeaderId = newHeaderId;
	}
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<FormCommunityCompetitionHeader :model="competition" @submit="onSubmit" />
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped></style>
