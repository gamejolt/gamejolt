import { Options, Prop, Vue } from 'vue-property-decorator';
import { Environment } from '../../environment/environment.service';
import { Sellable } from '../../sellable/sellable.model';

@Options({})
export default class AppWidgetCompilerWidgetGamePackages extends Vue {
	@Prop({ type: Array, default: () => [] })
	sellables!: Sellable[];
	@Prop({ type: String, default: 'dark' })
	theme!: string;

	widgetHost = Environment.widgetHost;
}
