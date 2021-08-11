import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ConfigService } from './config.service';

@Options({})
export class AppConfigLoaded extends Vue {
	@Prop({ type: String, default: 'div', required: false })
	tag!: string;

	render() {
		return h(this.tag, ConfigService.isLoaded ? this.$slots.default : null);
	}
}
