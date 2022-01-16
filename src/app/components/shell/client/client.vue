<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { getDeviceOS } from '../../../../_common/device/device.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppClientIntro from '../../client/intro/intro.vue';
import { AppClientSystemProgress } from '../../client/system-progress/system-progress';

@Options({
	components: {
		AppClientIntro,
		AppClientSystemProgress,
	},
})
export default class AppShellClient extends Vue {
	commonStore = setup(() => useCommonStore());

	get userBootstrapped() {
		return this.commonStore.userBootstrapped;
	}

	isShowingIntro = true;

	get os() {
		return getDeviceOS();
	}
}
</script>

<template>
	<div>
		<app-client-intro v-if="userBootstrapped && isShowingIntro" @finish="isShowingIntro = false" />
		<app-client-system-progress />
	</div>
</template>
