<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityCompetitionAwardModel } from '../../../../../../_common/community/competition/award/award.model';
import { CommunityCompetitionModel } from '../../../../../../_common/community/competition/competition.model';
import AppFormControlTextarea from '../../../../../../_common/form-vue/controls/AppFormControlTextarea.vue';
import { BaseForm, FormOnBeforeSubmit } from '../../../../../../_common/form-vue/form.service';

class Wrapper extends BaseForm<CommunityCompetitionAwardModel> {}

@Options({
	components: {
		AppFormControlTextarea,
	},
})
export default class FormCommunityCompetitionAward
	extends mixins(Wrapper)
	implements FormOnBeforeSubmit
{
	@Prop({ type: Object, required: true }) competition!: CommunityCompetitionModel;

	// being used? no refs.
	modelClass = CommunityCompetitionAwardModel;

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
	<AppForm :controller="form">
		<AppFormGroup name="name" :label="$gettext(`Award Name`)">
			<AppFormControl
				:validators="[
					validateMaxLength(50),
					validateAvailability({
						url: nameAvailabilityUrl,
					}),
				]"
				validate-on-blur
				:placeholder="$gettext(`1st Place, Best Graphics, etc...`)"
			/>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="description" :label="$gettext(`Award Description`)" optional>
			<AppFormControlTextarea :validators="[validateMaxLength(250)]" />
			<AppFormControlErrors />

			<p class="help-block">
				<AppTranslate>
					Descriptions aren't required, but you may use them if the award name isn't
					descriptive enough.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormButton show-when-valid>
			<AppTranslate>Save Award</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
