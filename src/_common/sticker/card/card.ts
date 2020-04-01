import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { Sticker } from '../sticker.model';

@Component({})
export default class AppStickerCard extends Vue {
	@Prop(propRequired(Sticker)) sticker!: Sticker;
	@Prop(propOptional(String)) label!: string;
}
