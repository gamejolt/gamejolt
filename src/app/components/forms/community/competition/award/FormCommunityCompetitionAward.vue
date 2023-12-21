<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import {
	$saveCommunityCompetitionAward,
	CommunityCompetitionAwardModel,
} from '../../../../../../_common/community/competition/award/award.model';
import { CommunityCompetitionModel } from '../../../../../../_common/community/competition/competition.model';
import AppForm, {
	createForm,
	FormController,
} from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlTextarea from '../../../../../../_common/form-vue/controls/AppFormControlTextarea.vue';
import {
	validateAvailability,
	validateMaxLength,
} from '../../../../../../_common/form-vue/validators';

const props = defineProps({
	competition: {
		type: Object as PropType<CommunityCompetitionModel>,
		required: true,
	},
});

const { competition } = toRefs(props);

const nameAvailabilityUrl = computed(() => {
	let endpoint =
		'/web/dash/communities/competitions/awards/check-field-availability/' +
		competition.value.id;

	if (form.formModel?.id) {
		endpoint += '/' + form.formModel.id;
	}

	return endpoint;
});

const form: FormController<CommunityCompetitionAwardModel> = createForm({
	modelClass: CommunityCompetitionAwardModel,
	modelSaveHandler: $saveCommunityCompetitionAward,
	onBeforeSubmit() {
		// When creating a new award, this field isn't set yet.
		if (!form.formModel.community_competition_id) {
			form.formModel.community_competition_id = competition.value.id;
		}
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
