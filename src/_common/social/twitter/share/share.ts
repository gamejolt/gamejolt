import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import '../../social.styl';
import { TwitterSdk } from '../sdk/sdk.service';

@Options({})
export class AppSocialTwitterShare extends Vue {
	@Prop(String) content!: string;
	@Prop(String) url?: string;
	@Prop({ type: String, default: 'small' })
	size!: string;

	render() {
		return h('a', {
			class: 'twitter-share-button',
			href: 'https://twitter.com/share',
			'data-text': this.content,
			'data-url': this.url,
			'data-size': this.size,
		});
	}

	mounted() {
		TwitterSdk.load();
	}
}
