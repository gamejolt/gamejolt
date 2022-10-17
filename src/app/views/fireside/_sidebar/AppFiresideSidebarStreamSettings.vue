<script lang="ts" setup>
import { computed, ref } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { startStreaming, stopStreaming } from '../../../../_common/fireside/rtc/producer';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import {
	shouldPromoteAppForStreaming,
	useFiresideController,
} from '../../../components/fireside/controller/controller';
import AppFiresideStreamSetup from '../../../components/fireside/stream/setup/AppFiresideStreamSetup.vue';
import { illNoCommentsSmall, illStreamingJelly } from '../../../img/ill/illustrations';
import AppFiresideSidebar from './AppFiresideSidebar.vue';
import AppFiresideSidebarHeading from './AppFiresideSidebarHeading.vue';

const c = useFiresideController()!;
const {
	canBrowserStream,
	isStreamingElsewhere,
	isPersonallyStreaming,
	rtc,
	shouldShowDesktopAppPromo,
	setSidebar,
	sidebarHome,
	isDraft,
} = c;

const isStartingStream = ref(false);
const isInvalidConfig = ref(true);

const producer = computed(() => rtc.value?.producer);
const isProducerBusy = computed(() => !!producer.value?.isBusy?.value);

async function onClickStartStreaming() {
	const _producer = producer.value;
	if (!_producer || isStartingStream.value) {
		return;
	}
	isStartingStream.value = true;

	try {
		await startStreaming(_producer);
	} catch {
		showErrorGrowl($gettext(`Something went wrong when starting your stream.`));
	}

	isStartingStream.value = false;

	// Only close the modal if we were able to start streaming.
	if (_producer.isStreaming.value) {
		setSidebar(sidebarHome, 'started-streaming');
	}
}

async function onClickStopStreaming() {
	const _producer = producer.value;
	if (!_producer) {
		return;
	}

	try {
		const shouldStop = await ModalConfirm.show(
			$gettext(`Are you sure you want to stop streaming?`)
		);

		if (!shouldStop) {
			return;
		}

		await stopStreaming(_producer, 'stream-settings');
	} catch {
		showErrorGrowl($gettext(`Something went wrong when stopping your stream.`));
	}

	// Only close the modal if we were able to stop streaming.
	if (!_producer.isStreaming.value) {
		setSidebar(sidebarHome, 'stopped-streaming-sidebar');
	}
}
</script>

<template>
	<AppFiresideSidebar>
		<template #header>
			<AppFiresideSidebarHeading>
				<AppTranslate>Stream Settings</AppTranslate>
			</AppFiresideSidebarHeading>
		</template>

		<template #body>
			<AppScrollScroller>
				<div class="-body">
					<template v-if="!canBrowserStream">
						<AppIllustration :asset="illNoCommentsSmall">
							<p class="-warning-text">
								<AppTranslate>
									Your browser either cannot stream, or will have poor
									performance.
								</AppTranslate>
							</p>
							<p class="-warning-text">
								<template v-if="shouldPromoteAppForStreaming">
									<AppTranslate>
										For the best streaming experience, we recommend using the
										Game Jolt desktop app.
									</AppTranslate>
								</template>
								<template v-else>
									<AppTranslate>
										Please use a different browser, such as Google Chrome or
										Microsoft Edge, if you want to start a stream.
									</AppTranslate>
								</template>
							</p>
						</AppIllustration>

						<template v-if="shouldPromoteAppForStreaming">
							<AppSpacer vertical :scale="4" />

							<AppButton
								icon="client"
								primary
								solid
								block
								:to="{ name: 'landing.app' }"
								target="_blank"
							>
								<AppTranslate>Get the desktop app</AppTranslate>
							</AppButton>
						</template>
					</template>
					<template v-else-if="shouldShowDesktopAppPromo">
						<div class="-app-promo">
							<AppIllustration :asset="illStreamingJelly">
								<p class="-ill-text">
									<AppTranslate>
										For the best streaming experience, we recommend using the
										Game Jolt desktop app.
									</AppTranslate>
								</p>
							</AppIllustration>

							<AppSpacer vertical :scale="4" />

							<AppButton
								icon="client"
								primary
								solid
								block
								:to="{ name: 'landing.app' }"
								target="_blank"
							>
								<AppTranslate>Get the desktop app</AppTranslate>
							</AppButton>

							<AppButton trans block @click="shouldShowDesktopAppPromo = false">
								<AppTranslate>Use web anyway</AppTranslate>
							</AppButton>
						</div>
					</template>
					<template v-else-if="isStreamingElsewhere">
						<AppIllustration :asset="illNoCommentsSmall">
							<p class="-warning-text">
								<AppTranslate>
									You're currently streaming on another device. Stop that stream
									before starting a new one.
								</AppTranslate>
							</p>
						</AppIllustration>
					</template>
					<template v-else>
						<AppFiresideStreamSetup
							:c="c"
							hide-publish-controls
							@close="setSidebar('chat', 'stream-settings-closed')"
							@is-invalid="isInvalidConfig = $event"
						/>
					</template>
				</div>
			</AppScrollScroller>
		</template>

		<template #footer>
			<div v-if="canBrowserStream && !shouldShowDesktopAppPromo" class="-footer">
				<div v-if="isDraft" class="-private-hint">
					This won't make your fireside public. Other hosts in the fireside will be able
					to see your stream.
				</div>

				<AppButton
					v-if="!isStreamingElsewhere && !isPersonallyStreaming"
					primary
					solid
					block
					:disabled="isProducerBusy || isInvalidConfig"
					@click="onClickStartStreaming()"
				>
					Start {{ isDraft ? 'private' : 'public' }} stream
				</AppButton>
				<AppButton
					v-else-if="isPersonallyStreaming"
					primary
					solid
					block
					:disabled="isProducerBusy"
					fill-color="overlay-notice"
					@click="onClickStopStreaming()"
				>
					<AppTranslate>Stop streaming</AppTranslate>
				</AppButton>
			</div>
		</template>
	</AppFiresideSidebar>
</template>

<style lang="stylus" scoped>
.-body
.-footer
	padding: 16px

.-warning-text
	color: var(--theme-fg)

.-private-hint
	font-size: $font-size-small
	margin-bottom: 12px
	color: var(--theme-fg-muted)
</style>
