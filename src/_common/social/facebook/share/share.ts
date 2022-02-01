import { h } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import '../../social.styl';
import { FacebookSdk } from '../sdk/sdk.service';

@Options({})
export class AppSocialFacebookShare extends Vue {
	@Prop(String) url!: string;

	render() {
		return h('div', {
			class: 'fb-share-button',
			'data-href': this.url,
			'data-layout': 'button',
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
