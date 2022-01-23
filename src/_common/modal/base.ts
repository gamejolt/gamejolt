import { inject } from 'vue';
import { Options, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../utils/vue';
import AppModal from './AppModal.vue';
import { Modal, ModalKey } from './modal.service';

@Options({
	components: {
		AppModal,
	},
})
export class BaseModal extends Vue {
	modal = shallowSetup(() => inject(ModalKey) as Modal);
}
