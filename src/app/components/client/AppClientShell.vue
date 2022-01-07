<script lang="ts" setup>
import { ref } from 'vue';
import { useAppStore } from '../../../_common/store/app-store';
import AppClientIntro from '../client/intro/intro.vue';
import { AppClientSystemProgress } from '../client/system-progress/system-progress';

const appStore = useAppStore();
const isShowingIntro = ref(true);
</script>

<template>
	<div>
		<AppClientIntro
			v-if="appStore.userBootstrapped && isShowingIntro"
			@finish="isShowingIntro = false"
		/>
		<AppClientSystemProgress />
	</div>
</template>
