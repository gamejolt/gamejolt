<script lang="ts">
import { Vue } from 'vue-property-decorator';
import { Navigate } from '../../navigate/navigate.service';

export default class AppErrorPageOffline extends Vue {
	retry() {
		Navigate.reload();
	}
}
</script>

<template>
	<div>
		<h1><AppTranslate>Can't Connect</AppTranslate></h1>
		<p>
			<strong><AppTranslate>We are having trouble connecting to Game Jolt.</AppTranslate></strong>
		</p>
		<p><AppTranslate>Check your internet connection and try again.</AppTranslate></p>
		<br />

		<p>
			<AppButton primary @click="retry">
				<AppTranslate>Retry</AppTranslate>
			</AppButton>
		</p>
	</div>
</template>
