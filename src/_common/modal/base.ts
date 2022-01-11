import { Options, Prop, Provide, Vue } from 'vue-property-decorator';
import { Modal, ModalKey } from './modal.service';
import AppModal from './modal.vue';

@Options({
	components: {
		AppModal,
	},
})
export class BaseModal extends Vue {
	@Prop({ type: Object })
	@Provide({ to: ModalKey })
	modal!: Modal;
}
