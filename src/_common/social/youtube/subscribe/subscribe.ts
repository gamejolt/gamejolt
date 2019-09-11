import Vue, { CreateElement } from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import '../../social.styl';

import { YoutubeSdk } from '../sdk/sdk.service';

@Component({})
export class AppSocialYoutubeSubscribe extends Vue {
	@Prop(String) channel!: string;
	@Prop({ type: String, default: 'default' })
	layout!: string;
	@Prop({ type: String, default: 'default' })
	theme!: string;

	render(h: CreateElement) {
		return h(
			'div',
			{
				staticClass: 'social-youtube-subscribe',
			},
			[
				h('div', {
					staticClass: 'g-ytsubscribe',
					attrs: {
						'data-channelid': this.channel,
						'data-layout': this.layout,
						'data-theme': this.theme,
						'data-count': 'default',
					},
				}),
			]
		);
	}

	mounted() {
		this.init();
	}

	@Watch('channel')
	@Watch('layout')
	@Watch('theme')
	changed() {
		this.init();
	}

	private init() {
		YoutubeSdk.load();
	}
}
