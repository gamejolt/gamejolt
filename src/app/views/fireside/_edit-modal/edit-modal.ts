import { mixins, Options, Prop } from 'vue-property-decorator';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { BaseModal } from '../../../../_common/modal/base';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import FormFiresideEdit from '../../../components/forms/fireside/edit/edit.vue';

@Options({
	components: {
		FormFiresideEdit,
	},
})
export default class AppFiresideEditModal extends mixins(BaseModal) {
	@Prop({ type: Fireside, required: true })
	fireside!: Fireside;

	onFormSubmit() {
		this.modal.resolve();
	}

	async onClickExtinguish() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to extinguish your Fireside?`)
		);
		if (!result) {
			return;
		}

		this.fireside.$extinguish();

		this.modal.resolve();
	}
}
