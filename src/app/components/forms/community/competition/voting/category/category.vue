<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityCompetition } from '../../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionVotingCategory } from '../../../../../../../_common/community/competition/voting-category/voting-category.model';
import AppFormControlTextarea from '../../../../../../../_common/form-vue/controls/AppFormControlTextarea.vue';
import { BaseForm, FormOnBeforeSubmit } from '../../../../../../../_common/form-vue/form.service';

class Wrapper extends BaseForm<CommunityCompetitionVotingCategory> {}

@Options({
	components: {
		AppFormControlTextarea,
	},
})
export default class FormCommunityCompetitionVotingCategory
	extends mixins(Wrapper)
	implements FormOnBeforeSubmit
{
	@Prop({ type: Object, required: true }) competition!: CommunityCompetition;

	modelClass = CommunityCompetitionVotingCategory;

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
	<app-form :controller="form">
		<app-form-group name="name" :label="$gettext(`Category Name`)">
			<app-form-control
				:validators="[
					validateMaxLength(50),
					validateAvailability({
						url: nameAvailabilityUrl,
					}),
				]"
				validate-on-blur
				:placeholder="$gettext(`Graphics, Sound, etc...`)"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="description" :label="$gettext(`Category Description`)" optional>
			<app-form-control-textarea :validators="[validateMaxLength(250)]" />
			<app-form-control-errors />

			<p class="help-block">
				<translate>
					Often a description isn't needed. We suggest filling it in only for
					clarification if the name isn't guidance enough.
				</translate>
			</p>
		</app-form-group>

		<app-form-button show-when-valid>
			<translate>Save Category</translate>
		</app-form-button>
	</app-form>
</template>
