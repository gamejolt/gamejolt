<script lang="ts" setup>
import AppLinkExternal from '../../_common/link/AppLinkExternal.vue';
import AppTranslate from '../../_common/translate/AppTranslate.vue';
import { useGameserverStore } from '../store/index';

const { build, username, token, javaArchive, javaCodebase, embedWidth, embedHeight } =
	useGameserverStore();
</script>

<template>
	<div v-if="build" style="margin: 0 auto; text-align: center">
		<applet
			:code="build.java_class_name"
			:archive="javaArchive"
			:codebase="javaCodebase"
			:width="embedWidth"
			:height="embedHeight"
		>
			<param
				v-for="param of build.params"
				:key="param.name"
				:name="param.name"
				:value="param.value"
			/>

			<param name="gjapi_username" :value="username" />
			<param name="gjapi_token" :value="token" />

			<p>
				<AppTranslate>You need Java installed to play this game.</AppTranslate>
				<br />
				<AppTranslate>You may use the button below to get it.</AppTranslate>
			</p>

			<AppLinkExternal href="https://java.com/download">
				<img
					src="https://java.com/en/img/everywhere/getjava_lg.gif"
					alt="Get Java"
					style="border-style: none"
				/>
			</AppLinkExternal>
		</applet>
	</div>
</template>
