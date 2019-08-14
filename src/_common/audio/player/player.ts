import Vue, { CreateElement } from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { GameSong } from '../../game/song/song.model';

interface DurationPayload {
	currentTime: number;
	duration: number;
}

@Component({})
export class AppAudioPlayer extends Vue {
	@Prop(GameSong)
	song!: GameSong;

	$el!: HTMLAudioElement;

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

	render(h: CreateElement) {
		return h('audio', {
			domProps: {
				src: this.song.url,
				preload: 'auto',
			},
		});
	}

	destroyed() {
		this.clearWatcher();
	}

	seek(time: number) {
		this.$el.currentTime = time;
	}

	private async setup() {
		this.clearWatcher();

		await this.$nextTick();

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
