import { Options, Prop, Vue } from 'vue-property-decorator';
import { Screen } from '../../screen/screen-service';

@Options({})
export default class AppNavTabList extends Vue {
	@Prop(Boolean) center?: boolean;

	readonly Screen = Screen;
}
