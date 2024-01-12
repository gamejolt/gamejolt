<script lang="ts" setup>
import { PropType, toRef, toRefs } from 'vue';
import {
	$saveCommunityChannel,
	CommunityChannelModel,
} from '../../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../../_common/community/community.model';
import AppForm, {
	FormController,
	createForm,
	defineFormProps,
} from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlError from '../../../../../../_common/form-vue/AppFormControlError.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import {
	validateAvailability,
	validateMaxLength,
	validateMinLength,
	validatePattern,
} from '../../../../../../_common/form-vue/validators';
import { showCommunityChannelBackgroundModal } from '../../../../community/channel/background-modal/background-modal.service';
import AppCommunityChannelCardEdit from '../../../../community/channel/card/edit/AppCommunityChannelCardEdit.vue';
import AppFormCommunityChannelPermissions from '../_permissions/permissions.vue';

interface FormModel extends CommunityChannelModel {
	permission_posting?: string;
}

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	...defineFormProps<CommunityChannelModel>(true),
});

const emit = defineEmits({
	backgroundChange: (_model: CommunityChannelModel) => true,
	submit: () => true,
});

const { community, model } = toRefs(props);

const titleAvailabilityUrl = toRef(
	() =>
		`/web/dash/communities/channels/check-field-availability/${community.value.id}/${
			model.value!.id
		}`
);
const loadUrl = toRef(
	() => `/web/dash/communities/channels/save/${community.value.id}/${form.formModel.id}`
);

const shouldShowPermissions = toRef(() => model.value && !model.value.is_archived);

const form: FormController<FormModel> = createForm({
	model,
	modelClass: CommunityChannelModel,
	loadUrl,
	modelSaveHandler: $saveCommunityChannel,
	onLoad(payload: any) {
		form.formModel.permission_posting = payload.permission_posting ?? 'all';
	},
	onSubmitSuccess() {
		emit('backgroundChange', form.formModel);
		emit('submit');
	},
});

async function onClickEditBackground() {
	await showCommunityChannelBackgroundModal(form.formModel);
	emit('backgroundChange', form.formModel);
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="display_title" :label="$gettext(`Display Name`)" optional>
			<div class="help-block">
				{{
					$gettext(
						`This should be short and to the point. If you don't fill in a display name, we'll use your channel's URL path as its name.`
					)
				}}
			</div>

			<AppFormControl
				:validators="[validateMinLength(3), validateMaxLength(30)]"
				validate-on-blur
				:placeholder="form.formModel.title"
			/>

			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="title" :label="$gettext(`URL Path`)">
			<AppFormControl
				type="text"
				:validators="[
					validateMinLength(3),
					validateMaxLength(30),
					validatePattern(/^[a-z0-9_]+$/i),
					validateAvailability({
						url: titleAvailabilityUrl,
					}),
				]"
				:validate-delay="500"
			/>
			<AppFormControlErrors>
				<AppFormControlError
					when="availability"
					:message="
						$gettext('A channel in this community with that URL path already exists.')
					"
				/>

				<AppFormControlError
					when="pattern"
					:message="
						$gettext(
							'Channel URL paths can only contain numbers, letters, and underscores (_).'
						)
					"
				/>
			</AppFormControlErrors>
		</AppFormGroup>

		<AppCommunityChannelCardEdit
			:background="form.formModel.background"
			@click="onClickEditBackground"
		/>

		<br />

		<AppFormCommunityChannelPermissions v-if="shouldShowPermissions" />

		<AppFormButton show-when-valid>
			{{ $gettext(`Save Channel`) }}
		</AppFormButton>
	</AppForm>
</template>
