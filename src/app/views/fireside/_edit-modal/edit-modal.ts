import { Component, Prop } from 'vue-property-decorator';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { FiresideController } from '../../../components/fireside/controller/controller';
import FormFiresideEdit from '../../../components/forms/fireside/edit/edit.vue';

@Component({
	components: {
		FormFiresideEdit,
		AppLoading,
	},
})
export default class AppFiresideEditModal extends BaseModal {
	@Prop({ type: FiresideController, required: true })
	controller!: FiresideController;

	onFormSubmit() {
		this.modal.resolve();
	}

	get canExtinguish() {
		return this.controller.canExtinguish;
	}

	async onClickExtinguish() {
		if (!this.controller.fireside || !this.canExtinguish) {
			return;
		}

		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to extinguish your Fireside?`)
		);
		if (!result) {
			return;
		}

		this.controller.fireside.$extinguish();

		this.modal.resolve();
	}
}
