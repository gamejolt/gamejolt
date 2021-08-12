import { h } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import '../../social.styl';
import { FacebookSdk } from '../sdk/sdk.service';

@Options({})
export class AppSocialFacebookSend extends Vue {
	@Prop(String) url!: string;

	render() {
		return h('div', {
			class: 'fb-send',
			'data-href': this.url,
		});
	}

	mounted() {
		this.init();
	}

	@Watch('url')
	changed() {
		this.init();
	}

	private init() {
		FacebookSdk.load();
	}
}
