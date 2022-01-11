import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { Model } from '../../model/model.service';
import { CommentModal, DisplayMode } from '../modal/modal.service';

@Options({
	directives: {
		AppAuthRequired,
	},
})
export default class AppCommentAddButton extends Vue {
	@Prop(Object)
	model!: Model;

	@Prop(String)
	placeholder?: string;

	@Prop(String)
	displayMode!: DisplayMode;

	get placeholderText() {
		return this.placeholder ? this.placeholder : this.$gettext('What do you think?');
	}

	open() {
		CommentModal.show({
			model: this.model,
			displayMode: this.displayMode,
		});
	}
}
