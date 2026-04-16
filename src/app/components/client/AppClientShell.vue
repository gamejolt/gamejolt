<script lang="ts" setup>
import { ref } from 'vue';

import AppClientSystemProgress from '~app/components/client/AppClientSystemProgress.vue';
import AppClientIntro from '~app/components/client/intro/AppClientIntro.vue';
import { useCommonStore } from '~common/store/common-store';

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
