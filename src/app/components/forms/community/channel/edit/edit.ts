import { Emit, mixins, Options, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import AppFormControlUpload from '../../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmitSuccess,
} from '../../../../../../_common/form-vue/form.service';
import { AppImgResponsive } from '../../../../../../_common/img/responsive/responsive';
import { CommunityChannelBackgroundModal } from '../../../../community/channel/background-modal/background-modal.service';
import AppCommunityChannelCardEdit from '../../../../community/channel/card/edit/edit.vue';
import AppFormCommunityChannelPermissions from '../_permissions/permissions.vue';

class FormModel extends CommunityChannel {
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
	@Prop(propRequired(Community)) community!: Community;

	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;

	modelClass = FormModel;

	@Emit('background-change') emitBackgroundChange(_model: CommunityChannel) {}

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
