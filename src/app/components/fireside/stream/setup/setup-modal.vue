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
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<template v-if="!c.canBrowserStream.value">
			<div class="modal-body">
				<AppIllustration :src="illNoCommentsSmall">
					<p>
						<AppTranslate>
							Your browser either cannot stream, or will have poor performance.
						</AppTranslate>
					</p>
					<p>
						<AppTranslate>
							Please use a different browser, such as Google Chrome or Microsoft Edge,
							if you want to start a stream.
						</AppTranslate>
					</p>
				</AppIllustration>
			</div>
		</template>
		<template v-else-if="c.isStreamingElsewhere.value">
			<div class="modal-body">
				<AppIllustration :src="illNoCommentsSmall">
					<p>
						<AppTranslate>
							You're currently streaming on another device. Stop that stream before
							starting a new one.
						</AppTranslate>
					</p>
				</AppIllustration>
			</div>
		</template>
		<template v-else>
			<div class="modal-body">
				<AppStreamSetup :c="c" @close="onClose()" />
			</div>
		</template>
	</AppModal>
</template>
