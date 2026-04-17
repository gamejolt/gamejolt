<script lang="ts" setup>
import { Navigate } from '~common/navigate/navigate.service';

type Props = {
	email: string;
};
const { email } = defineProps<Props>();

function onClick() {
	if (!GJ_IS_DESKTOP_APP) {
		Navigate.gotoExternal(`mailto:${email}`);
		return;
	}

	// Sometimes Vue router will break <a> tags that use mailto by replacing
	// part of the current url with the mailto path, so we can instead use
	// 'Navigate.goto(path)' to bypass this.
	Navigate.goto(`mailto:${email}`);
}
</script>

<template>
	<a :title="email" @click="onClick()">
		<slot />
	</a>
</template>
