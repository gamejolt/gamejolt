import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Sellable } from '../../sellable/sellable.model';
import { Environment } from '../../environment/environment.service';

@Component({})
export default class AppWidgetCompilerWidgetGamePackages extends Vue {
	@Prop({ type: Array, default: () => [] })
	sellables!: Sellable[];
	@Prop({ type: String, default: 'dark' })
	theme!: string;

	widgetHost = Environment.widgetHost;
}
