import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Modal } from './modal.service';

@Options({})
export class AppModalWrapper extends Vue {
	@Prop({ type: Modal }) modal!: Modal;

	render() {
		// TODO(vue3): These props don't seem to be passed through properly for
		// things like AppLikesModal.
		return h(this.modal.component, {
			modal: this.modal,
			...this.modal.props,
		});
	}
}
