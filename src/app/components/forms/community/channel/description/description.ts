import { Options } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import AppFormControlContent from '../../../../../../_common/form-vue/control/content/content.vue';
import { BaseForm, FormOnLoad } from '../../../../../../_common/form-vue/form.service';

@Options({
	components: {
		AppFormControlContent,
	},
})
export default class FormCommunityChannelDescription
	extends BaseForm<CommunityChannel>
	implements FormOnLoad
{
	modelClass = CommunityChannel;
	saveMethod = '$saveDescription' as const;
	lengthLimit = 5_000;

	get loadUrl() {
		return `/web/dash/communities/description/save-channel/${this.model!.id}`;
	}

	onLoad(payload: any) {
		this.lengthLimit = payload.lengthLimit;
	}
}
