<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityCompetitionModel } from '../../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionVotingCategoryModel } from '../../../../../../../_common/community/competition/voting-category/voting-category.model';
import AppFormControlTextarea from '../../../../../../../_common/form-vue/controls/AppFormControlTextarea.vue';
import { BaseForm, FormOnBeforeSubmit } from '../../../../../../../_common/form-vue/form.service';

class Wrapper extends BaseForm<CommunityCompetitionVotingCategoryModel> {}

@Options({
	components: {
		AppFormControlTextarea,
	},
})
export default class FormCommunityCompetitionVotingCategory
	extends mixins(Wrapper)
	implements FormOnBeforeSubmit
{
	@Prop({ type: Object, required: true }) competition!: CommunityCompetitionModel;

	modelClass = CommunityCompetitionVotingCategoryModel;

	get isAdding() {
		return !this.model;
	}

	get nameAvailabilityUrl() {
		let endpoint =
			'/web/dash/communities/competitions/voting-categories/check-field-availability/' +
			this.competition.id;

		if (this.model?.id) {
			endpoint += '/' + this.model.id;
		}

		return endpoint;
	}

	onBeforeSubmit() {
		// When creating a new category, this field isn't set yet.
		if (!this.formModel.community_competition_id) {
			this.setField('community_competition_id', this.competition.id);
		}
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="name" :label="$gettext(`Category Name`)">
			<AppFormControl
				:validators="[
					validateMaxLength(50),
					validateAvailability({
						url: nameAvailabilityUrl,
					}),
				]"
				validate-on-blur
				:placeholder="$gettext(`Graphics, Sound, etc...`)"
			/>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="description" :label="$gettext(`Category Description`)" optional>
			<AppFormControlTextarea :validators="[validateMaxLength(250)]" />
			<AppFormControlErrors />

			<p class="help-block">
				<AppTranslate>
					Often a description isn't needed. We suggest filling it in only for
					clarification if the name isn't guidance enough.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormButton show-when-valid>
			<AppTranslate>Save Category</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
