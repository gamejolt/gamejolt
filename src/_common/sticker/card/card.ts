import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { Sticker } from '../sticker.model';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppStickerCard extends Vue {
	@Prop({ type: Object, required: true }) sticker!: Sticker;
	@Prop({ type: String, default: undefined }) label?: string;
	@Prop({ type: Boolean, default: false }) isNew!: boolean;
}
