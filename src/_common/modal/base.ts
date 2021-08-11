import { Options, Prop, Vue } from 'vue-property-decorator';
import { Modal } from './modal.service';
import AppModal from './modal.vue';

@Options({
	components: {
		AppModal,
	},
})
export class BaseModal extends Vue {
	@Prop(Modal) modal!: Modal;
}
