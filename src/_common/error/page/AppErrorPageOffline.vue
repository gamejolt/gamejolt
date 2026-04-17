<script lang="ts" setup>
import AppButton from '~common/button/AppButton.vue';
import { Navigate } from '~common/navigate/navigate.service';
import { $gettext } from '~common/translate/translate.service';

function retry() {
	Navigate.reload();
}
</script>

<template>
	<div>
		<h1>{{ $gettext(`Can't connect`) }}</h1>
		<p>
			<strong>{{ $gettext(`We're having trouble connecting to Game Jolt.`) }}</strong>
		</p>
		<p>{{ $gettext(`Check your internet connection and try again.`) }}</p>
		<br />

		<p>
			<AppButton primary @click="retry">
				{{ $gettext(`Retry`) }}
			</AppButton>
		</p>
	</div>
</template>
