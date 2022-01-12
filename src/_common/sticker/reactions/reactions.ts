import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { numberSort } from '../../../utils/array';
import { shallowSetup } from '../../../utils/vue';
import { useDrawerStore } from '../../drawer/drawer-store';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { StickerTargetController, toggleStickersShouldShow } from '../target/target-controller';
import AppStickerReactionsItem from './item.vue';

@Options({
	components: {
		AppStickerReactionsItem,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppStickerReactions extends Vue {
	@Prop({ type: Object, required: true }) controller!: StickerTargetController;

	drawerStore = shallowSetup(() => useDrawerStore());

	@Emit('show') emitShow() {}

	private animate = false;

	get canShowBorder() {
		return !this.controller.isLive;
	}

	get showAsActive() {
		return this.canShowBorder && this.controller.shouldShow;
	}

	get shouldAnimate() {
		return this.animate;
	}

	get reactions() {
		return [...this.controller.model.sticker_counts].sort((a, b) =>
			numberSort(b.count, a.count)
		);
	}

	mounted() {
		//  Wait for a little bit before setting this. We want new reactions to
		//  animate themselves, but not the initial ones.
		setTimeout(() => {
			this.animate = this.controller.isLive;
		}, 1_000);
	}

	onClick() {
		// Stickers in a Live context will automatically remove themselves - do nothing.
		if (this.controller.isLive) {
			return;
		}

		toggleStickersShouldShow(this.controller, true);

		if (this.controller.shouldShow) {
			this.emitShow();
		}
	}
}
