<script lang="ts" setup>
import AppButton from '../../../../_common/button/AppButton.vue';
import AppHeaderBar from '../../../../_common/header/AppHeaderBar.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppFiresideSettings from '../../../components/fireside/AppFiresideSettings.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideShare from '../AppFiresideShare.vue';
import AppFiresideSidebar from './AppFiresideSidebar.vue';

const emit = defineEmits({
	back: () => true,
	streamSettings: () => true,
});

const c = useFiresideController()!;
const { canEdit, isDraft } = c;
</script>

<template>
	<AppFiresideSidebar>
		<template #header>
			<AppHeaderBar :elevation="2">
				<template #leading>
					<AppButton circle sparse trans icon="chevron-left" @click="emit('back')" />
				</template>

				<template #title>
					<AppTranslate>Options</AppTranslate>
				</template>
			</AppHeaderBar>

			<div v-if="canEdit" class="-pad">
				<AppButton block @click="emit('streamSettings')">
					<AppTranslate>Stream settings</AppTranslate>
				</AppButton>
			</div>
		</template>

		<template #body>
			<div class="-pad">
				<AppFiresideSettings v-if="canEdit" :c="c" />

				<AppSpacer vertical :scale="4" />

				<AppFiresideShare v-if="!isDraft" class="-share" />

				<AppButton v-if="!canEdit" icon="flag" trans block>
					<AppTranslate>Report fireside</AppTranslate>
				</AppButton>
			</div>
		</template>
	</AppFiresideSidebar>
</template>

<style lang="stylus" scoped>
.-pad
	padding: 16px
</style>
