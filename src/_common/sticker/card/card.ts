import { Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { Sticker } from '../sticker.model';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppStickerCard extends Vue {
	@Prop(propRequired(Object)) sticker!: Sticker;
	@Prop(propOptional(String)) label!: string;
	@Prop(propOptional(Boolean, false)) isNew!: boolean;
}
