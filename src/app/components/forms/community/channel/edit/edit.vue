<script lang="ts">
import { Emit, mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityChannelModel } from '../../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../../_common/community/community.model';
import AppFormControlUpload from '../../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmitSuccess,
} from '../../../../../../_common/form-vue/form.service';
import AppImgResponsive from '../../../../../../_common/img/AppImgResponsive.vue';
import { CommunityChannelBackgroundModal } from '../../../../community/channel/background-modal/background-modal.service';
import AppCommunityChannelCardEdit from '../../../../community/channel/card/edit/edit.vue';
import AppFormCommunityChannelPermissions from '../_permissions/permissions.vue';

class FormModel extends CommunityChannelModel {
	permission_posting = 'all';
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppImgResponsive,
		AppFormControlUpload,
		AppFormCommunityChannelPermissions,
		AppCommunityChannelCardEdit,
	},
})
export default class FormCommunityChannelEdit
	extends mixins(Wrapper)
	implements FormOnLoad, FormOnSubmitSuccess
{
	@Prop({ type: Object, required: true }) community!: CommunityModel;

	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;

	modelClass = FormModel;

	@Emit('background-change') emitBackgroundChange(_model: CommunityChannelModel) {}

	get competitionId() {
		return this.model!.competition?.id;
	}

	get loadUrl() {
		return `/web/dash/communities/channels/save/${this.community.id}/${this.formModel.id}`;
	}

	get titleAvailabilityUrl() {
		return `/web/dash/communities/channels/check-field-availability/${this.community.id}/${
			this.model!.id
		}`;
	}

	get shouldShowPermissions() {
		return this.model && !this.model.is_archived;
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;

		this.setField('permission_posting', payload.permission_posting ?? 'all');
	}

	onSubmitSuccess() {
		this.emitBackgroundChange(this.formModel);
	}

	async onClickEditBackground() {
		await CommunityChannelBackgroundModal.show(this.formModel);
		this.emitBackgroundChange(this.formModel);
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="display_title" :label="$gettext(`Display Name`)" optional>
			<div class="help-block">
				<AppTranslate>
					This should be short and to the point. If you don't fill in a display name,
					we'll use your channel's URL path as its name.
				</AppTranslate>
			</div>

			<AppFormControl
				:validators="[validateMinLength(3), validateMaxLength(30)]"
				validate-on-blur
				:placeholder="formModel.title"
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
			:background="formModel.background"
			@click="onClickEditBackground"
		/>

		<br />

		<AppFormCommunityChannelPermissions v-if="shouldShowPermissions" />

		<AppFormButton show-when-valid>
			<AppTranslate>Save Channel</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
