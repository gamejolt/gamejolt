import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppVolumeMeter extends Vue {
	@Prop(Number)
	volume!: number;

	get volumePercent() {
		return 'calc(' + Math.max(0, Math.min(100, this.volume * 100)) + '% + 4px)';
	}
}
