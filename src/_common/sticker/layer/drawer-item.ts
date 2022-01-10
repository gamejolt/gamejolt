import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { DrawerStore, DrawerStoreKey } from '../../drawer/drawer-store';
import { Sticker } from '../sticker.model';

@Options({})
export default class AppStickerLayerDrawerItem extends Vue {
	@Prop(propRequired(Sticker)) sticker!: Sticker;
	@Prop(propOptional(Number, 0)) count!: number;
	@Prop(propOptional(Number, 64)) size!: number;
	@Prop(propOptional(Boolean, false)) hideCount!: boolean;

	@Inject({ from: DrawerStoreKey })
	drawerStore!: DrawerStore;

	declare $el: HTMLDivElement;

	get currentStreak() {
		const streak = this.drawerStore.streak;
		if (streak?.sticker.id !== this.sticker.id) {
			return 0;
		}

		return streak.count;
	}

	get itemStyling() {
		return {
			height: this.size + 'px',
			width: this.size + 'px',
			cursor: this.drawerStore.isDragging ? 'grabbing' : 'grab',
		};
	}

	get isPeeled() {
		return this.drawerStore.sticker?.id === this.sticker.id || this.count < 1;
	}
}
