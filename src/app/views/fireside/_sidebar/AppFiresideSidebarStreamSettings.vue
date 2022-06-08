<script lang="ts" setup>
import AppButton from '../../../../_common/button/AppButton.vue';
import AppHeaderBar from '../../../../_common/header/AppHeaderBar.vue';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideStreamSetup from '../../../components/fireside/stream/setup/AppFiresideStreamSetup.vue';
import { illNoCommentsSmall } from '../../../img/ill/illustrations';
import AppFiresideSidebar from './AppFiresideSidebar.vue';

const emit = defineEmits({
	back: () => true,
});

const c = useFiresideController()!;
const { canBrowserStream, isStreamingElsewhere } = c;
</script>

<template>
	<AppFiresideSidebar>
		<template #header>
			<AppHeaderBar :elevation="2">
				<template #leading>
					<AppButton circle sparse trans icon="chevron-left" @click="emit('back')" />
				</template>

				<template #title>
					<AppTranslate>Stream settings</AppTranslate>
				</template>
			</AppHeaderBar>
		</template>

		<template #body>
			<div class="-body">
				<template v-if="!canBrowserStream">
					<AppIllustration :src="illNoCommentsSmall">
						<p class="-warning-text">
							<AppTranslate>
								Your browser either cannot stream, or will have poor performance.
							</AppTranslate>
						</p>
						<p class="-warning-text">
							<AppTranslate>
								Please use a different browser, such as Google Chrome or Microsoft
								Edge, if you want to start a stream.
							</AppTranslate>
						</p>
					</AppIllustration>
				</template>
				<template v-else-if="isStreamingElsewhere">
					<AppIllustration :src="illNoCommentsSmall">
						<p class="-warning-text">
							<AppTranslate>
								You're currently streaming on another device. Stop that stream
								before starting a new one.
							</AppTranslate>
						</p>
					</AppIllustration>
				</template>
				<template v-else>
					<AppFiresideStreamSetup :c="c" @close="emit('back')" />
				</template>
			</div>
		</template>
	</AppFiresideSidebar>
</template>

<style lang="stylus" scoped>
.-body
	padding: 16px

.-warning-text
	color: var(--theme-fg)
</style>
