<script lang="ts" src="./unity"></script>

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
