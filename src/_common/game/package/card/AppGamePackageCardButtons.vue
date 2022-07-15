<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../../button/AppButton.vue';
import { formatFilesize } from '../../../filters/filesize';
import AppJolticon from '../../../jolticon/AppJolticon.vue';
import AppPopper from '../../../popper/AppPopper.vue';
import AppTranslate from '../../../translate/AppTranslate.vue';
import { GameBuild } from '../../build/build.model';
import { GamePackage } from '../package.model';
import AppGamePackageCardMoreOptions from './AppGamePackageCardMoreOptions.vue';
import { GamePackageCardModel } from './card.model';

defineProps({
	package: {
		type: Object as PropType<GamePackage>,
		required: true,
	},
	card: {
		type: Object as PropType<GamePackageCardModel>,
		required: true,
	},
});

const emit = defineEmits({
	click: (_data: { build: GameBuild; fromExtraSection: boolean }) => true,
});

function click(build: GameBuild, fromExtraSection = false) {
	emit('click', { build, fromExtraSection });
}
</script>

<template>
	<div class="game-package-card-app-buttons">
		<AppButton v-if="card.browserBuild" primary @click="click(card.browserBuild!)">
			<AppTranslate>Play</AppTranslate>
			<AppJolticon class="jolticon-addon" :icon="card.showcasedBrowserIcon" />
		</AppButton>

		{{ ' ' }}

		<AppButton
			v-if="card.downloadableBuild"
			:primary="!card.browserBuild"
			@click="click(card.downloadableBuild!)"
		>
			<AppTranslate>Download</AppTranslate>
			{{ ' ' }}
			<small v-if="card.platformSupportInfo[card.showcasedOs].arch == '64'">
				<AppTranslate>64-bit</AppTranslate>
			</small>
			<small class="hidden-xs">
				({{ formatFilesize(card.downloadableBuild.primary_file.filesize) }})
			</small>
			<AppJolticon class="jolticon-addon" :icon="card.showcasedOsIcon" />
		</AppButton>

		{{ ' ' }}

		<!--
		If this package only has "Other" builds, then we make it look like a download button with a
		[...] after. If the package has normal builds too, then we just show it as a more options
		sparse button.
		-->
		<AppPopper v-if="card.extraBuilds.length" popover-class="fill-darkest">
			<AppButton
				v-app-track-event="`game-package-card:more-options`"
				icon="ellipsis-v"
				:primary="card.otherOnly"
				:circle="!card.otherOnly"
				:trans="!card.otherOnly"
			>
				<template v-if="card.otherOnly">
					<AppTranslate>Download</AppTranslate>
					<AppJolticon class="jolticon-addon" icon="other-os" />
				</template>
			</AppButton>

			<template #popover>
				<AppGamePackageCardMoreOptions :card="card" @click="click($event, true)" />
			</template>
		</AppPopper>
	</div>
</template>
