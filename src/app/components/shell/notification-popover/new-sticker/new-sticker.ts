import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';

@Component({})
export default class AppShellNotificationPopoverNewSticker extends Vue {
	@Prop(propRequired(String)) stickerImg!: string;

	declare $refs: {
		newSticker: HTMLDivElement;
	};

	mounted() {
		// Self-destroy after animation finishes.
		this.$refs.newSticker.addEventListener('animationend', () => {
			this.$destroy();
			this.$el.parentNode?.removeChild(this.$el);
		});
	}
}
