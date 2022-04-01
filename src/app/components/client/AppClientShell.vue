<script lang="ts" setup>
import { ref } from 'vue';
import { useCommonStore } from '../../../_common/store/common-store';
import AppClientIntro from '../client/intro/intro.vue';
import AppClientSystemProgress from './AppClientSystemProgress.vue';

const { userBootstrapped } = useCommonStore();
const isShowingIntro = ref(true);
</script>

<template>
	<div>
		<AppClientIntro
			v-if="userBootstrapped && isShowingIntro"
			@finish="isShowingIntro = false"
		/>
		<AppClientSystemProgress />
	</div>
</template>
