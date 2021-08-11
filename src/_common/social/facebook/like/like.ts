import { h } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import '../../social.styl';
import { FacebookSdk } from '../sdk/sdk.service';

@Options({})
export class AppSocialFacebookLike extends Vue {
	@Prop(String) url!: string;
	@Prop({ type: Boolean, default: true })
	showShare!: boolean;

	render() {
		return h('div', {
			staticClass: 'fb-like',
			attrs: {
				'data-href': this.url,
				'data-share': this.showShare ? 'true' : 'false',
				'data-layout': 'button_count',
				'data-action': 'like',
				'data-show-faces': 'false',
			},
		});
	}

	mounted() {
		this.init();
	}

	@Watch('url')
	@Watch('showShare')
	changed() {
		this.init();
	}

	private init() {
		FacebookSdk.load();
	}
}
