import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppContentEmbedSoundcloud extends Vue {
	@Prop(String)
	trackId!: string;

	get embedSrc() {
		return (
			'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' +
			this.trackId +
			'&amp;color=2f7f6f'
		);
	}
}
