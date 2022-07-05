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

const isShowingAppPromo = ref(shouldPromoteAppForStreaming.value);
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<!-- In the case that their browser can't stream AND we want to show the
		app promo for their device, do a special message where we tell them they
		can't stream and they should just use the app -->
		<template v-if="!canBrowserStream && shouldPromoteAppForStreaming">
			<div class="modal-body">
				<AppIllustration :src="illNoCommentsSmall">
					<p class="-ill-text">
						<AppTranslate>
							Your browser either cannot stream, or will have poor performance.
						</AppTranslate>
					</p>
					<p class="-ill-text">
						<AppTranslate>
							For the best streaming experience, we recommend using the Game Jolt
							desktop app.
						</AppTranslate>
					</p>

					<AppSpacer vertical :scale="4" />

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
				</AppIllustration>
			</div>
		</template>
		<template v-else-if="!canBrowserStream">
			<div class="modal-body">
				<AppIllustration :src="illNoCommentsSmall">
					<p class="-ill-text">
						<AppTranslate>
							Your browser either cannot stream, or will have poor performance.
						</AppTranslate>
					</p>
					<p class="-ill-text">
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
					<p class="-ill-text">
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
					<p class="-ill-text">
						<AppTranslate>
							For the best streaming experience, we recommend using the Game Jolt
							desktop app.
						</AppTranslate>
					</p>
				</AppIllustration>

				<AppSpacer vertical :scale="4" />

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

.-ill-text
	color: var(--theme-fg)
</style>
