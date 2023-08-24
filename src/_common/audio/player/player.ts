import { h, nextTick } from 'vue';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { GameSongModel } from '../../game/song/song.model';

interface DurationPayload {
	currentTime: number;
	duration: number;
}

@Options({})
export class AppAudioPlayer extends Vue {
	@Prop(Object)
	song!: GameSongModel;

	declare $el: HTMLAudioElement;

	src = '';

	private timer?: NodeJS.Timer;

	@Emit('end')
	emitEnd() {}

	@Emit('duration')
	emitDuration(_payload: DurationPayload) {}

	@Watch('song.url')
	onChanged() {
		this.setup();
	}

	mounted() {
		this.setup();
	}

	render() {
		return h('audio', {
			src: this.song.url,
			preload: 'auto',
		});
	}

	unmounted() {
		this.clearWatcher();
	}

	seek(time: number) {
		this.$el.currentTime = time;
	}

	private async setup() {
		this.clearWatcher();

		await nextTick();

		this.$el.play();
		this.setWatcher();
	}

	private onSongEnded(sendEvent: boolean) {
		this.clearWatcher();

		if (sendEvent && this.onSongEnded) {
			this.emitEnd();
		}
	}

	private setWatcher() {
		this.timer = setInterval(() => {
			if (this.$el.ended) {
				this.onSongEnded(true);
			} else {
				this.emitDuration({
					currentTime: this.$el.currentTime,
					duration: this.$el.duration,
				});
			}
		}, 250);
	}

	private clearWatcher() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = undefined;
		}
	}
}
