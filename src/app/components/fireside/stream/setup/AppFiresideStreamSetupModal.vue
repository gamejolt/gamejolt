<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { illNoCommentsSmall } from '../../../../img/ill/illustrations';
import { FiresideController } from '../../controller/controller';
import AppFiresideStreamSetup from './AppFiresideStreamSetup.vue';

const props = defineProps({
	c: {
		type: Object as PropType<FiresideController>,
		required: true,
	},
});

// eslint-disable-next-line vue/no-setup-props-destructure
const { canBrowserStream, isStreamingElsewhere } = props.c;

const modal = useModal()!;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<template v-if="!canBrowserStream">
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
		<template v-else-if="isStreamingElsewhere">
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
				<AppFiresideStreamSetup :c="c" @close="modal.dismiss()" />
			</div>
		</template>
	</AppModal>
</template>
