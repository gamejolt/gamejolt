import { StyleValue } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../utils/vue';
import { useDrawerStore } from '../../drawer/drawer-store';
import { Sticker } from '../sticker.model';

@Options({})
export default class AppStickerLayerDrawerItem extends Vue {
	@Prop({ type: Object, required: true }) sticker!: Sticker;
	@Prop({ type: Number, default: 0 }) count!: number;
	@Prop({ type: Number, default: 64 }) size!: number;
	@Prop({ type: Boolean, default: false }) hideCount!: boolean;

	drawerStore = shallowSetup(() => useDrawerStore());

	declare $el: HTMLDivElement;

	get currentStreak() {
		const streak = this.drawerStore.streak.value;
		if (streak?.sticker.id !== this.sticker.id) {
			return 0;
		}

		return streak.count;
	}

	get itemStyling(): StyleValue {
		return {
			height: this.size + 'px',
			width: this.size + 'px',
			cursor: this.drawerStore.isDragging.value ? 'grabbing' : 'grab',
		};
	}

	get isPeeled() {
		return this.drawerStore.sticker.value?.id === this.sticker.id || this.count < 1;
	}
}
