import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { fuzzynumber } from '../../../filters/fuzzynumber';
import { Sticker } from '../../sticker.model';

@Component({})
export default class AppStickerReactionItem extends Vue {
	@Prop(propRequired(Sticker)) sticker!: Sticker;
	@Prop(propRequired(Number)) count!: number;

	get displayCount() {
		return fuzzynumber(this.count);
	}
}
