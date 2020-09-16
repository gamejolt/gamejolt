import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { BaseModal } from '../../modal/base';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import AppCommentWidget from '../widget/widget.vue';
import { DisplayMode } from './modal.service';

@Component({
	components: {
		AppCommentWidget,
	},
})
export default class AppCommentModal extends BaseModal {
	@Prop(String)
	displayMode!: DisplayMode;

	@Prop(Model)
	model!: Model;

	@Prop(propOptional(String))
	initialTab?: string;

	get autofocusAdd() {
		return !Screen.isXs;
	}

	onReplyAdd() {
		// Dismiss the modal when a reply is added.
		this.modal.dismiss();
	}
}
