<script lang="ts" setup>
import { computed, toRef } from 'vue';

import { CommunityCompetitionModel } from '~common/community/competition/competition.model';
import {
	$saveCommunityCompetitionVotingCategory,
	CommunityCompetitionVotingCategoryModel,
} from '~common/community/competition/voting-category/voting-category.model';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlTextarea from '~common/form-vue/controls/AppFormControlTextarea.vue';
import { validateAvailability, validateMaxLength } from '~common/form-vue/validators';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type FormModel = CommunityCompetitionVotingCategoryModel;

type Props = {
	competition: CommunityCompetitionModel;
	model?: CommunityCompetitionVotingCategoryModel;
};

const props = defineProps<Props>();

const emit = defineEmits<{
	submit: [payload: any];
}>();

const nameAvailabilityUrl = computed(() => {
	let endpoint =
		'/web/dash/communities/competitions/voting-categories/check-field-availability/' +
		props.competition.id;

	if (props.model?.id) {
		endpoint += '/' + props.model.id;
	}

	return endpoint;
});

const form: FormController<FormModel> = createForm<FormModel>({
	modelClass: CommunityCompetitionVotingCategoryModel,
	modelSaveHandler: $saveCommunityCompetitionVotingCategory,
	model: toRef(props, 'model'),
	onBeforeSubmit() {
		// When creating a new category, this field isn't set yet.
		if (!form.formModel.community_competition_id) {
			form.formModel.community_competition_id = props.competition.id;
		}
	},
	onSubmitSuccess(response) {
		emit('submit', response);
	},
});
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
