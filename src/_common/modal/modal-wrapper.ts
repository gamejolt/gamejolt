import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Modal } from './modal.service';

@Component({})
export class AppModalWrapper extends Vue {
	@Prop(Modal) modal!: Modal;

	render(h: CreateElement) {
		return h(this.modal.component, {
			props: {
				modal: this.modal,
				...this.modal.props,
			},
		});
	}
}
