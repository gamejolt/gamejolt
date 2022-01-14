<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';

@Options({})
export default class AppEmbedApplet extends Vue {
	@State url!: Store['url'];
	@State build!: Store['build'];
	@State username!: Store['username'];
	@State token!: Store['token'];
	@State javaArchive!: Store['javaArchive'];
	@State javaCodebase!: Store['javaCodebase'];
	@State embedWidth!: Store['embedWidth'];
	@State embedHeight!: Store['embedHeight'];
}
</script>

<template>
	<div style="margin: 0 auto; text-align: center">
		<applet
			:code="build.java_class_name"
			:archive="javaArchive"
			:codebase="javaCodebase"
			:width="embedWidth"
			:height="embedHeight"
		>
			<param
				v-for="param of build.params"
				:key="param"
				:name="param.name"
				:value="param.value"
			/>

			<param name="gjapi_username" :value="username" />
			<param name="gjapi_token" :value="token" />

			<p>
				<translate>You need Java installed to play this game.</translate>
				<br />
				<translate>You may use the button below to get it.</translate>
			</p>

			<app-link-external href="https://java.com/download">
				<img
					src="https://java.com/en/img/everywhere/getjava_lg.gif"
					alt="Get Java"
					style="border-style: none"
				/>
			</app-link-external>
		</applet>
	</div>
</template>
