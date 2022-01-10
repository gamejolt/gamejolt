import { Options, Prop, Vue } from 'vue-property-decorator';
import {
	FiresideRTCProducer,
	getOwnDesktopAudioVolume,
	getOwnMicAudioVolume,
} from '../../../../../_common/fireside/rtc/producer';

@Options({})
export default class AppVolumeMeter extends Vue {
	@Prop({ type: FiresideRTCProducer, required: true })
	producer!: FiresideRTCProducer;

	@Prop({ type: String, required: true })
	type!: 'mic' | 'desktop-audio';

	private refreshVolumeInterval: NodeJS.Timer | null = null;
	private volume = 0;

	mounted() {
		this.refreshVolumeInterval = setInterval(() => {
			this.volume =
				this.type === 'mic'
					? getOwnMicAudioVolume(this.producer)
					: getOwnDesktopAudioVolume(this.producer);
		}, 100);
	}

	unmounted() {
		if (this.refreshVolumeInterval) {
			clearInterval(this.refreshVolumeInterval);
		}
	}

	get volumePercent() {
		return 'calc(' + Math.max(0, Math.min(100, this.volume * 100)) + '% + 4px)';
	}
}
