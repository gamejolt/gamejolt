<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { BaseModal } from '../../../../../_common/modal/base';
import { illNoCommentsSmall } from '../../../../img/ill/illustrations';
import { FiresideController } from '../../controller/controller';
import AppStreamSetup from './setup.vue';

@Options({
	components: {
		AppStreamSetup,
		AppIllustration,
	},
})
export default class AppStreamSetupModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true })
	c!: FiresideController;

	readonly illNoCommentsSmall = illNoCommentsSmall;

	onClose() {
		this.modal.dismiss();
	}
}
</script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<template v-if="!c.canBrowserStream.value">
			<div class="modal-body">
				<app-illustration :src="illNoCommentsSmall">
					<p>
						<translate>
							Your browser either cannot stream, or will have poor performance.
						</translate>
					</p>
					<p>
						<translate>
							Please use a different browser, such as Google Chrome or Microsoft Edge,
							if you want to start a stream.
						</translate>
					</p>
				</app-illustration>
			</div>
		</template>
		<template v-else-if="c.isStreamingElsewhere.value">
			<div class="modal-body">
				<app-illustration :src="illNoCommentsSmall">
					<p>
						<translate>
							You're currently streaming on another device. Stop that stream before
							starting a new one.
						</translate>
					</p>
				</app-illustration>
			</div>
		</template>
		<template v-else>
			<div class="modal-body">
				<app-stream-setup :c="c" @close="onClose()" />
			</div>
		</template>
	</app-modal>
</template>
