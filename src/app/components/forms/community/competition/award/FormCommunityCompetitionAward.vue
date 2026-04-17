<script lang="ts" setup>
import { computed, toRef } from 'vue';

import {
	$saveCommunityCompetitionAward,
	CommunityCompetitionAwardModel,
} from '~common/community/competition/award/award.model';
import { CommunityCompetitionModel } from '~common/community/competition/competition.model';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlTextarea from '~common/form-vue/controls/AppFormControlTextarea.vue';
import { validateAvailability, validateMaxLength } from '~common/form-vue/validators';

type FormModel = CommunityCompetitionAwardModel;

type Props = {
	competition: CommunityCompetitionModel;
	model?: FormModel;
};
const { competition, model } = defineProps<Props>();

const emit = defineEmits<{
	submit: [model: CommunityCompetitionAwardModel];
}>();

const modelRef = toRef(() => model);

const nameAvailabilityUrl = computed(() => {
	let endpoint =
		'/web/dash/communities/competitions/awards/check-field-availability/' + competition.id;

	if (form.formModel?.id) {
		endpoint += '/' + form.formModel.id;
	}

	return endpoint;
});

const form: FormController<FormModel> = createForm<FormModel>({
	model: modelRef,
	modelClass: CommunityCompetitionAwardModel,
	modelSaveHandler: $saveCommunityCompetitionAward,
	onBeforeSubmit() {
		// When creating a new award, this field isn't set yet.
		if (!form.formModel.community_competition_id) {
			form.formModel.community_competition_id = competition.id;
		}
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});
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
				{{
					$gettext(
						`Descriptions aren't required, but you may use them if the award name isn't descriptive enough.`
					)
				}}
			</p>
		</AppFormGroup>

		<AppFormButton show-when-valid>
			{{ $gettext(`Save Award`) }}
		</AppFormButton>
	</AppForm>
</template>
