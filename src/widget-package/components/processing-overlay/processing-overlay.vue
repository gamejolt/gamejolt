<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import AppLoading from '../../../_common/loading/loading.vue';
import AppModal from '../modal/modal.vue';

@Options({
	components: {
		AppModal,
		AppLoading,
	},
})
export default class AppProcessingOverlay extends Vue {}
</script>

<template>
	<app-modal class="text-center" hide-close style="z-index: 20">
		<br />
		<br />
		<app-loading centered hide-label />
		<div>
			<strong>Processing... Hold on to your butts!</strong>
		</div>
	</app-modal>
</template>
