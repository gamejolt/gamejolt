import { Options, Vue } from 'vue-property-decorator';
import { AppModalWrapper } from './modal-wrapper';
import { Modals } from './modal.service';

@Options({
	components: {
		AppModalWrapper,
	},
})
export default class AppModals extends Vue {
	readonly Modals = Modals;
}
