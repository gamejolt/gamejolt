<script lang="ts" setup>
import AppButton from '../../../../_common/button/AppButton.vue';
import AppHeaderBar from '../../../../_common/header/AppHeaderBar.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import FormFiresideEdit from '../../../components/forms/fireside/FormFiresideEdit.vue';
import AppFiresideSidebar from './AppFiresideSidebar.vue';

const emit = defineEmits({
	back: () => true,
	streamSettings: () => true,
});

const c = useFiresideController()!;
const { fireside, chatRoom } = c;
</script>

<template>
	<AppFiresideSidebar>
		<template #header>
			<AppHeaderBar :elevation="2">
				<template #leading>
					<AppButton circle sparse trans icon="chevron-left" @click="emit('back')" />
				</template>

				<template #title>
					<AppTranslate>Fireside settings</AppTranslate>
				</template>
			</AppHeaderBar>

			<div class="-pad">
				<AppButton block @click="emit('streamSettings')">
					<AppTranslate>Stream settings</AppTranslate>
				</AppButton>
			</div>
		</template>

		<template #body>
			<div class="-pad">
				<FormFiresideEdit v-if="chatRoom" :fireside="fireside" :room="chatRoom" />
			</div>
		</template>
	</AppFiresideSidebar>
</template>

<style lang="stylus" scoped>
.-pad
	padding: 16px
</style>
