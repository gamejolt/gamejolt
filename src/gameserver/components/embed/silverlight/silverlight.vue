<template>
	<div style="position: relative; text-align: center;">
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
				<translate>You need Microsoft Silverlight installed to play this game.</translate>
				<br />
				<translate>You may use the button below to get it.</translate>
			</p>

			<a
				href="https://go.microsoft.com/fwlink/?LinkID=124807"
				onclick="window.open( this.href ); return false"
				rel="nofollow noopener"
			>
				<img
					src="https://go.microsoft.com/fwlink/?LinkId=108181"
					alt="Get Microsoft Silverlight"
					style="border-style: none"
				/>
			</a>
		</object>
	</div>
</template>

<script lang="ts" src="./silverlight"></script>
