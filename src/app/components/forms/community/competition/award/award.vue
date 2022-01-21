<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityCompetitionAward } from '../../../../../../_common/community/competition/award/award.model';
import { CommunityCompetition } from '../../../../../../_common/community/competition/competition.model';
import AppFormControlTextarea from '../../../../../../_common/form-vue/controls/AppFormControlTextarea.vue';
import { BaseForm, FormOnBeforeSubmit } from '../../../../../../_common/form-vue/form.service';

class Wrapper extends BaseForm<CommunityCompetitionAward> {}

@Options({
	components: {
		AppFormControlTextarea,
	},
})
export default class FormCommunityCompetitionAward
	extends mixins(Wrapper)
	implements FormOnBeforeSubmit
{
	@Prop({ type: Object, required: true }) competition!: CommunityCompetition;

	modelClass = CommunityCompetitionAward;

	get isAdding() {
		return !this.model;
	}

	get nameAvailabilityUrl() {
		let endpoint =
			'/web/dash/communities/competitions/awards/check-field-availability/' +
			this.competition.id;

		if (this.model?.id) {
			endpoint += '/' + this.model.id;
		}

		return endpoint;
	}

	onBeforeSubmit() {
		// When creating a new award, this field isn't set yet.
		if (!this.formModel.community_competition_id) {
			this.setField('community_competition_id', this.competition.id);
		}
	}
}
</script>

<template>
	<app-form :controller="form">
		<app-form-group name="name" :label="$gettext(`Award Name`)">
			<app-form-control
				:validators="[
					validateMaxLength(50),
					validateAvailability({
						url: nameAvailabilityUrl,
					}),
				]"
				validate-on-blur
				:placeholder="$gettext(`1st Place, Best Graphics, etc...`)"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="description" :label="$gettext(`Award Description`)" optional>
			<app-form-control-textarea :validators="[validateMaxLength(250)]" />
			<app-form-control-errors />

			<p class="help-block">
				<translate>
					Descriptions aren't required, but you may use them if the award name isn't
					descriptive enough.
				</translate>
			</p>
		</app-form-group>

		<app-form-button show-when-valid>
			<translate>Save Award</translate>
		</app-form-button>
	</app-form>
</template>
