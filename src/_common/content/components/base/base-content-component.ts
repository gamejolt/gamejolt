import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
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

	@Emit('removed')
	emitRemoved() {}

	@Emit('edit')
	emitEdit() {}

	onRemovedClicked() {
		if (!this.isDisabled) {
			this.emitRemoved();
		}
	}

	onEditClicked() {
		if (!this.isDisabled) {
			this.emitEdit();
		}
	}
}
