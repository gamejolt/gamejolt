<script lang="ts" setup>
import { toRefs } from 'vue';
import { Navigate } from '../navigate/navigate.service';

const props = defineProps({
	email: {
		type: String,
		required: true,
	},
});

const { email } = toRefs(props);

function onClick() {
	if (!GJ_IS_DESKTOP_APP) {
		Navigate.gotoExternal(`mailto:${email.value}`);
		return;
	}

	// Sometimes Vue router will break <a> tags that use mailto by replacing
	// part of the current url with the mailto path, so we can instead use
	// 'Navigate.goto(path)' to bypass this.
	Navigate.goto(`mailto:${email.value}`);
}
</script>

<template>
	<a :title="email" @click="onClick()">
		<slot />
	</a>
</template>
