import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ConfigService } from './config.service';

@Component({})
export class AppConfigLoaded extends Vue {
	@Prop({ type: String, default: 'div', required: false })
	tag!: string;

	render(h: CreateElement) {
		return h(this.tag, ConfigService.isLoaded ? this.$slots.default : null);
	}
}
