<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { CommunityCompetitionModel } from '../../../../../../../_common/community/competition/competition.model';
import {
	$saveCommunityCompetitionVotingCategory,
	CommunityCompetitionVotingCategoryModel,
} from '../../../../../../../_common/community/competition/voting-category/voting-category.model';
import AppForm, {
	FormController,
	createForm,
	defineFormProps,
} from '../../../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlTextarea from '../../../../../../../_common/form-vue/controls/AppFormControlTextarea.vue';
import {
	validateAvailability,
	validateMaxLength,
} from '../../../../../../../_common/form-vue/validators';

const props = defineProps({
	competition: {
		type: Object as PropType<CommunityCompetitionModel>,
		required: true,
	},
	...defineFormProps<CommunityCompetitionVotingCategoryModel>(),
});

const emit = defineEmits({
	submit: (_model: CommunityCompetitionVotingCategoryModel) => true,
});

const { competition, model } = toRefs(props);

const nameAvailabilityUrl = computed(() => {
	let endpoint =
		'/web/dash/communities/competitions/voting-categories/check-field-availability/' +
		competition.value.id;

	if (model?.value?.id) {
		endpoint += '/' + model.value.id;
	}

	return endpoint;
});

let isAdding = false;

const form: FormController<CommunityCompetitionVotingCategoryModel> = createForm({
	model,
	modelClass: CommunityCompetitionVotingCategoryModel,
	modelSaveHandler: $saveCommunityCompetitionVotingCategory,
	onInit() {
		isAdding = !model?.value;
	},
	onBeforeSubmit() {
		// When creating a new category, this field isn't set yet.
		if (!form.formModel.community_competition_id) {
			form.formModel.community_competition_id = competition.value.id;
		}
	},
	onSubmitSuccess() {
		if (isAdding) {
			emit('submit', form.formModel);
		}
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
				{{
					$gettext(
						`Often a description isn't needed. We suggest filling it in only for clarification if the name isn't guidance enough.`
					)
				}}
			</p>
		</AppFormGroup>

		<AppFormButton show-when-valid>
			{{ $gettext(`Save Category`) }}
		</AppFormButton>
	</AppForm>
</template>
