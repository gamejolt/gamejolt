<template>
	<div style="margin: 0 auto; text-align: center;">
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
				<translate>You need Adobe Flash player installed to play this game.</translate>
				<br />
				<translate>You may use the button below to get it.</translate>
			</p>

			<external-link href="https://www.adobe.com/go/getflash">
				<img
					src="https://www.adobe.com/images/shared/download_buttons/get_flash_player.gif"
					alt="Get Adobe Flash player"
					style="border-style: none"
				/>
			</external-link>
		</object>
	</div>
</template>

<script lang="ts" src="./flash"></script>
