import { Options, Vue } from 'vue-property-decorator';
import { AppModalWrapper } from './modal-wrapper';
import { Modal } from './modal.service';

@Options({
	components: {
		AppModalWrapper,
	},
})
export default class AppModals extends Vue {
	readonly Modal = Modal;
}
