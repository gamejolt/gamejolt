import Vue, { CreateElement } from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import '../../social.styl';

import { FacebookSdk } from '../sdk/sdk.service';

@Component({})
export class AppSocialFacebookSend extends Vue {
	@Prop(String) url!: string;

	render(h: CreateElement) {
		return h('div', {
			staticClass: 'fb-send',
			attrs: {
				'data-href': this.url,
			},
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
