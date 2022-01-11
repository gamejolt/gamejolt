import { mixins, Options, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../modal/base';
import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import AppCommentWidget from '../widget/widget.vue';
import { DisplayMode } from './modal.service';

@Options({
	components: {
		AppCommentWidget,
	},
})
export default class AppCommentModal extends mixins(BaseModal) {
	@Prop(String)
	displayMode!: DisplayMode;

	@Prop(Object)
	model!: Model;

	@Prop(String)
	initialTab?: string;

	get autofocusAdd() {
		return !Screen.isXs;
	}

	onReplyAdd() {
		// Dismiss the modal when a reply is added.
		this.modal.dismiss();
	}
}
