import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import '../../social.styl';

import { TwitterSdk } from '../sdk/sdk.service';

@Component({})
export class AppSocialTwitterFollow extends Vue {
	@Prop(String) handle!: string;
	@Prop({ type: Boolean, default: true })
	showCount!: boolean;
	@Prop({ type: String, default: 'small' })
	size!: string;

	render(h: CreateElement) {
		return h('a', {
			staticClass: 'twitter-follow-button',
			attrs: {
				href: 'https://twitter.com/' + this.handle,
				'data-show-count': this.showCount ? 'true' : 'false',
				'data-size': this.size,
			},
		});
	}

	mounted() {
		TwitterSdk.load();
	}
}
