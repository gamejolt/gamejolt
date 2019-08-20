import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppMeter extends Vue {
	@Prop(Number) rating!: number;
	@Prop(Boolean) big?: boolean;

	get level() {
		return (this.rating || 0) * 2;
	}
}
