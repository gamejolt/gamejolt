import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { Sticker } from '../sticker.model';

@Component({})
export default class AppStickerCard extends Vue {
	@Prop(propRequired(Sticker)) sticker!: Sticker;
	@Prop(propOptional(Number, 0)) count!: number;

	get rarityLabel() {
		switch (this.sticker.rarity) {
			case 0:
				return this.$gettext(`Common`);
			case 1:
				return this.$gettext(`Uncommon`);
			case 2:
				return this.$gettext(`Rare`);
			case 3:
				return this.$gettext(`Epic`);
		}
	}
}
