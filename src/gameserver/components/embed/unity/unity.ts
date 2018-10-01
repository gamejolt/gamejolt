import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./unity.html';

import { loadScript } from '../../../../lib/gj-lib-client/utils/utils';
import { Store } from '../../../store/index';

declare const UnityObject2: any;

@View
@Component({})
export class AppEmbedUnity extends Vue {
	@State url!: Store['url'];
	@State build!: Store['build'];
	@State username!: Store['username'];
	@State token!: Store['token'];
	@State embedWidth!: Store['embedWidth'];
	@State embedHeight!: Store['embedHeight'];

	isMissing = false;
	isBroken = false;
	isUnsupported = false;
	unity: any = null;

	async mounted() {
		const build = this.build!;

		await Promise.all([
			import('jquery').then($ => {
				(window as any).$ = $;
				(window as any).jQuery = $;
			}),
			loadScript(
				'https://ssl-webplayer.unity3d.com/download_webplayer-3.x/3.0/uo/UnityObject2.js'
			),
		]);

		// Can be called by a game to automatically log in a user.
		(<any>window).GJAPI_AuthUser = (objectName: string, functionName: string) => {
			if (this.username && this.token) {
				this.unity
					.getUnity()
					.SendMessage(objectName, functionName, `${this.username}:${this.token}`);
			} else {
				this.unity.getUnity().SendMessage(objectName, functionName, '');
			}
		};

		const config: any = {
			width: this.embedWidth,
			height: this.embedHeight,
			params: {
				enableDebugging: '0',
			},
		};

		if (build.browser_disable_right_click) {
			config.params.disableContextMenu = true;
		}

		this.unity = new UnityObject2(config);

		this.unity.observeProgress((progress: any) => {
			switch (progress.pluginStatus) {
				case 'unsupported':
					{
						this.isUnsupported = true;
					}
					break;

				case 'broken':
					{
						this.isBroken = true;
					}
					break;

				case 'missing':
					{
						this.isMissing = true;
					}
					break;

				case 'installed':
					{
						this.isMissing = false;
						this.isBroken = false;
						this.isUnsupported = false;
					}
					break;
			}
		});

		this.unity.initPlugin(this.$el, this.url);
	}

	installPlugin() {
		this.unity.installPlugin();
	}
}
