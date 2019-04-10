<template>
	<div style="margin: 0 auto; text-align: center;">
		<applet
			:code="build.java_class_name"
			:archive="javaArchive"
			:codebase="javaCodebase"
			:width="embedWidth"
			:height="embedHeight"
		>
			<param v-for="param of build.params" :name="param.name" :value="param.value" />

			<param name="gjapi_username" :value="username" />
			<param name="gjapi_token" :value="token" />

			<p>
				<translate>You need Java installed to play this game.</translate>
				<br />
				<translate>You may use the button below to get it.</translate>
			</p>

			<a href="https://java.com/download" onclick="window.open( this.href ); return false">
				<img
					src="https://java.com/en/img/everywhere/getjava_lg.gif"
					alt="Get Java"
					style="border-style: none"
				/>
			</a>
		</applet>
	</div>
</template>

<script lang="ts" src="./applet"></script>
