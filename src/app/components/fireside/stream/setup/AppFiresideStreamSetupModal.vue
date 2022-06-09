<script lang="ts" setup>
import { PropType, ref } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { illNoCommentsSmall, illStreamingJelly } from '../../../../img/ill/illustrations';
import { FiresideController } from '../../controller/controller';
import AppFiresideStreamSetup from './AppFiresideStreamSetup.vue';
import { shouldPromoteAppForStreaming } from './setup-modal.service';

const props = defineProps({
	c: {
		type: Object as PropType<FiresideController>,
		required: true,
	},
});

// The controller will never change.
// eslint-disable-next-line vue/no-setup-props-destructure
const { canBrowserStream, isStreamingElsewhere } = props.c;

const modal = useModal()!;

const isShowingAppPromo = ref(shouldPromoteAppForStreaming);
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
		<template v-else-if="isShowingAppPromo">
			<div class="-app-promo">
				<AppIllustration :src="illStreamingJelly">
					<div class="-app-promo-text">
						<AppTranslate>
							For the best streaming experience, we recommend using the Game Jolt
							desktop app.
						</AppTranslate>
					</div>
				</AppIllustration>

				<AppSpacer vertical :scale="8" />

				<AppButton
					icon="client"
					primary
					solid
					block
					:to="{ name: 'landing.client' }"
					target="_blank"
				>
					<AppTranslate>Get the desktop app</AppTranslate>
				</AppButton>

				<AppButton trans block @click="isShowingAppPromo = false">
					<AppTranslate>Use web anyway</AppTranslate>
				</AppButton>
			</div>
		</template>
		<template v-else>
			<div class="modal-body">
				<AppFiresideStreamSetup :c="c" @close="modal.dismiss()" />
			</div>
		</template>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-app-promo
	padding: 16px

.-app-promo-text
	color: var(--theme-fg)
</style>
