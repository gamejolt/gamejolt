<script lang="ts" setup>
import AppButton from '~common/button/AppButton.vue';
import { formatFilesize } from '~common/filters/filesize';
import { GameBuildModel } from '~common/game/build/build.model';
import AppGamePackageCardMoreOptions from '~common/game/package/card/AppGamePackageCardMoreOptions.vue';
import { GamePackageCardModel } from '~common/game/package/card/card.model';
import { GamePackageModel } from '~common/game/package/package.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppPopper from '~common/popper/AppPopper.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	package: GamePackageModel;
	card: GamePackageCardModel;
};
defineProps<Props>();

const emit = defineEmits<{
	click: [data: { build: GameBuildModel; fromExtraSection: boolean }];
}>();

function click(build: GameBuildModel, fromExtraSection = false) {
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
			v-if="card.primaryBuild"
			:primary="!card.browserBuild"
			@click="click(card.primaryBuild!)"
		>
			<AppTranslate>Download</AppTranslate>
			{{ ' ' }}
			<small v-if="card.platformSupportInfo[card.showcasedOs].arch == '64'">
				<AppTranslate>64-bit</AppTranslate>
			</small>
			<small class="hidden-xs">
				({{ formatFilesize(card.primaryBuild.primary_file.filesize) }})
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
