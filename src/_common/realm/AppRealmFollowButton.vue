<script lang="ts" setup>
import { PropType } from 'vue';
import { Realm } from './realm-model';
import AppButton from '../button/AppButton.vue';
import AppTranslate from '../translate/AppTranslate.vue';

const props = defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
});
</script>

<template>
	<AppButton>
		<template v-if="!realm.is_following">
			<AppTranslate>Follow</AppTranslate>
		</template>
		<template v-else>
			<AppTranslate>Following</AppTranslate>
		</template>
	</AppButton>
</template>

<style lang="stylus" scoped></style>
