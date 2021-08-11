import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Modal } from './modal.service';

@Options({})
export class AppModalWrapper extends Vue {
	@Prop(Modal) modal!: Modal;

	render() {
		return h(this.modal.component, {
			props: {
				modal: this.modal,
				...this.modal.props,
			},
		});
	}
}
