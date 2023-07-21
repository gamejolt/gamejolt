<script lang="ts" setup>
import { computed } from 'vue';
import AppLinkExternal from '../../_common/link/AppLinkExternal.vue';
import AppTranslate from '../../_common/translate/AppTranslate.vue';
import { useGameserverStore } from '../store/index';

const { url, username, token, embedWidth, embedHeight } = useGameserverStore();

const query = computed(() => {
	if (username.value && token.value) {
		return `?gjapi_username=${username.value}&gjapi_token=${token.value}`;
	}
	return '';
});
</script>

<template>
	<div style="margin: 0 auto; text-align: center">
		<object
			type="application/x-shockwave-flash"
			:data="url"
			:width="embedWidth"
			:height="embedHeight"
		>
			<param name="allowFullScreen" value="true" />
			<param name="allowFullScreenInteractive" value="true" />
			<param name="wmode" value="direct" />
			<param name="flashvars" :value="encodeURIComponent(query)" />

			<p>
				<AppTranslate>
					You need Adobe Flash player installed to play this game.
				</AppTranslate>
				<br />
				<AppTranslate>You may use the button below to get it.</AppTranslate>
			</p>

			<AppLinkExternal href="https://www.adobe.com/go/getflash">
				<img
					src="https://www.adobe.com/images/shared/download_buttons/get_flash_player.gif"
					alt="Get Adobe Flash player"
					style="border-style: none"
				/>
			</AppLinkExternal>
		</object>
	</div>
</template>
