import { Options, Prop, Vue } from 'vue-property-decorator';
import { BackdropController } from './backdrop.service';

@Options({})
export default class AppBackdrop extends Vue {
	@Prop({ type: Object }) controller!: BackdropController;

	get className() {
		return this.controller.className;
	}

	onClicked() {
		if (this.controller.onClicked) {
			this.controller.onClicked();
		}
	}

	remove() {
		this.controller.remove();
	}
}
