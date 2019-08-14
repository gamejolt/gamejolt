import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Modal } from './modal.service';
import AppModal from './modal.vue'

@Component({
	components: {
		AppModal,
	},
})
export class BaseModal extends Vue {
	@Prop(Modal) modal!: Modal;
}
