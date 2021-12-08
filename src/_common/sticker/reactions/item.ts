import { Options, Prop, Vue } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { formatFuzzynumber } from '../../filters/fuzzynumber';

@Options({})
export default class AppStickerReactionsItem extends Vue {
	@Prop(propRequired(Number)) count!: number;
	@Prop(propRequired(String)) imgUrl!: string;

	get displayCount() {
		return formatFuzzynumber(this.count);
	}
}
