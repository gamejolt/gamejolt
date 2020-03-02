import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppModalWrapper } from './modal-wrapper';
import { Modal } from './modal.service';

@Component({
	components: {
		AppModalWrapper,
	},
})
export default class AppModals extends Vue {
	readonly Modal = Modal;
}
