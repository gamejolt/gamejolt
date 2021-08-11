import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppWidgetCompilerWidgetSoundcloud extends Vue {
	@Prop({ type: String, default: '' })
	trackId!: string;
	@Prop({ type: String, default: '' })
	color!: string;

	embedSrc = '';

	created() {
		this.embedSrc =
			'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' +
			this.trackId;

		if (this.color) {
			this.embedSrc += '&amp;color=' + this.color;
		}
	}
}
