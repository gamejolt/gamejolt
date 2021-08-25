import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { FiresideHostRtc } from '../fireside-host-rtc';

@Component({})
export default class AppVolumeMeter extends Vue {
	@Prop(propRequired(FiresideHostRtc)) hostRtc!: FiresideHostRtc;
	@Prop(propRequired(String)) type!: 'mic' | 'desktop-audio';

	private refreshVolumeInterval: NodeJS.Timer | null = null;
	private volume = 0;

	mounted() {
		this.refreshVolumeInterval = setInterval(() => {
			this.volume =
				this.type === 'mic'
					? this.hostRtc.getMicAudioVolume()
					: this.hostRtc.getDesktopAudioVolume();
		}, 100);
	}

	destroyed() {
		if (this.refreshVolumeInterval) {
			clearInterval(this.refreshVolumeInterval);
		}
	}

	get volumePercent() {
		return 'calc(' + Math.max(0, Math.min(100, this.volume * 100)) + '% + 4px)';
	}
}
