<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { loadScript } from '../../../../utils/utils';
import { Store } from '../../../store/index';

declare const UnityObject2: any;

@Options({})
export default class AppEmbedUnity extends Vue {
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
</script>

<template>
	<div style="text-align: center">
		<div class="missing" :hidden="!isMissing">
			<app-link-external
				href="https://unity3d.com/webplayer/"
				title="Unity Web Player. Install now!"
			>
				<p>
					<translate>This content requires the Unity Web Player.</translate>
				</p>
				<img
					alt="Unity Web Player. Install now!"
					src="https://ssl-webplayer.unity3d.com/installation/getunity.png"
					width="193"
					height="63"
				/>
			</app-link-external>
		</div>

		<div class="broken" :hidden="!isBroken">
			<app-link-external
				href="https://unity3d.com/webplayer/"
				title="Unity Web Player. Install now! Restart your browser after install."
			>
				<p>
					<translate>This content requires the Unity Web Player.</translate>
				</p>
				<img
					alt="Unity Web Player. Install now! Restart your browser after install."
					src="https://ssl-webplayer.unity3d.com/installation/getunityrestart.png"
					width="193"
					height="63"
				/>
			</app-link-external>
		</div>

		<div class="unsupported" :hidden="!isUnsupported">
			<p>
				<translate>The Unity web player does not work on your system.</translate>
			</p>
		</div>
	</div>
</template>
