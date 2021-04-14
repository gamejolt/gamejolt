import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { Sticker } from '../sticker.model';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppStickerCard extends Vue {
	@Prop(propRequired(Sticker)) sticker!: Sticker;
	@Prop(propOptional(String)) label!: string;
	@Prop(propOptional(Boolean, false)) isNew!: boolean;
}
