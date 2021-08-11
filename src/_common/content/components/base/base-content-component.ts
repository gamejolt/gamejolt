import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppTooltip } from '../../../tooltip/tooltip-directive';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppBaseContentComponent extends Vue {
	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(Boolean)
	showEdit!: boolean;

	@Prop(Boolean)
	isDisabled!: boolean;

	onRemovedClicked() {
		if (!this.isDisabled) {
			this.$emit('removed');
		}
	}

	onEditClicked() {
		if (!this.isDisabled) {
			this.$emit('edit');
		}
	}
}
