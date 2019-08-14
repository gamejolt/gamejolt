import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { importContext } from '../../../utils/utils';

@Component({})
export default class AppLoading extends Vue {
	@Prop({ type: String, default: 'Loading...' })
	label!: string;
	@Prop(Boolean) hideLabel!: boolean;
	@Prop(Boolean) big!: boolean;
	@Prop(Boolean) noColor!: boolean;
	@Prop(Boolean) stationary!: boolean;
	@Prop(Boolean) centered!: boolean;

	images = importContext(require.context('../../../components/loading/', false, /\.gif$/));

	get img() {
		const img =
			'loading' +
			(this.stationary ? '-stationary' : '') +
			(this.noColor ? '-bw' : '') +
			(this.big ? '-2x' : '');

		return this.images[`./${img}.gif`];
	}
}
