<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import AppLinkExternal from '../../_common/link/AppLinkExternal.vue';
import AppTranslate from '../../_common/translate/AppTranslate.vue';
import { loadScript } from '../../utils/utils';
import { useGameserverStore } from '../store';

declare const UnityObject2: any;

const { url, build, username, token, embedWidth, embedHeight } = useGameserverStore();

const isMissing = ref(false);
const isBroken = ref(false);
const isUnsupported = ref(false);
let unity: any;

const root = ref<HTMLElement>();

onMounted(async () => {
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
		if (username.value && token.value) {
			unity
				.getUnity()
				.SendMessage(objectName, functionName, `${username.value}:${token.value}`);
		} else {
			unity.getUnity().SendMessage(objectName, functionName, '');
		}
	};

	const config: any = {
		width: embedWidth.value,
		height: embedHeight.value,
		params: {
			enableDebugging: '0',
		},
	};

	if (build.value!.browser_disable_right_click) {
		config.params.disableContextMenu = true;
	}

	unity = new UnityObject2(config);

	unity.observeProgress((progress: any) => {
		switch (progress.pluginStatus) {
			case 'unsupported':
				{
					isUnsupported.value = true;
				}
				break;

			case 'broken':
				{
					isBroken.value = true;
				}
				break;

			case 'missing':
				{
					isMissing.value = true;
				}
				break;

			case 'installed':
				{
					isMissing.value = false;
					isBroken.value = false;
					isUnsupported.value = false;
				}
				break;
		}
	});

	unity.initPlugin(root.value, url.value);
});
</script>

<template>
	<div ref="root" style="text-align: center">
		<div class="missing" :hidden="!isMissing">
			<AppLinkExternal
				href="https://unity3d.com/webplayer/"
				title="Unity Web Player. Install now!"
			>
				<p>
					<AppTranslate>This content requires the Unity Web Player.</AppTranslate>
				</p>
				<img
					alt="Unity Web Player. Install now!"
					src="https://ssl-webplayer.unity3d.com/installation/getunity.png"
					width="193"
					height="63"
				/>
			</AppLinkExternal>
		</div>

		<div class="broken" :hidden="!isBroken">
			<AppLinkExternal
				href="https://unity3d.com/webplayer/"
				title="Unity Web Player. Install now! Restart your browser after install."
			>
				<p>
					<AppTranslate>This content requires the Unity Web Player.</AppTranslate>
				</p>
				<img
					alt="Unity Web Player. Install now! Restart your browser after install."
					src="https://ssl-webplayer.unity3d.com/installation/getunityrestart.png"
					width="193"
					height="63"
				/>
			</AppLinkExternal>
		</div>

		<div class="unsupported" :hidden="!isUnsupported">
			<p>
				<AppTranslate>The Unity web player does not work on your system.</AppTranslate>
			</p>
		</div>
	</div>
</template>
