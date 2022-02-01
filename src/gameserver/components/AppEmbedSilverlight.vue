<script lang="ts" setup>
import AppLinkExternal from '../../_common/link/AppLinkExternal.vue';
import AppTranslate from '../../_common/translate/AppTranslate.vue';
import { useGameserverStore } from '../store';

const { url, username, token, embedWidth, embedHeight } = useGameserverStore();
</script>

<template>
	<div style="position: relative; text-align: center">
		<object
			data="data:application/x-silverlight-2,"
			type="application/x-silverlight-2"
			:width="embedWidth"
			:height="embedHeight"
		>
			<param name="source" :value="url" />
			<param name="enableHtmlAccess" value="false" />
			<param name="background" value="black" />
			<param name="EnableGPUAcceleration" value="true" />

			<param
				v-if="username && token"
				name="initParams"
				:value="`gjapi_username=${username},gjapi_token=${token}`"
			/>

			<p>
				<AppTranslate>
					You need Microsoft Silverlight installed to play this game.
				</AppTranslate>
				<br />
				<AppTranslate>You may use the button below to get it.</AppTranslate>
			</p>

			<AppLinkExternal href="https://go.microsoft.com/fwlink/?LinkID=124807">
				<img
					src="https://go.microsoft.com/fwlink/?LinkId=108181"
					alt="Get Microsoft Silverlight"
					style="border-style: none"
				/>
			</AppLinkExternal>
		</object>
	</div>
</template>
