<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { RealmFollowSource } from '../analytics/analytics.service';
import { vAppAuthRequired } from '../auth/auth-required-directive';
import AppButton from '../button/AppButton.vue';
import { useCommonStore } from '../store/common-store';
import AppTranslate from '../translate/AppTranslate.vue';
import { RealmModel, toggleRealmFollow } from './realm-model';

const props = defineProps({
	realm: {
		type: Object as PropType<RealmModel>,
		required: true,
	},
	source: {
		type: String as PropType<RealmFollowSource>,
		required: true,
	},
	block: {
		type: Boolean,
	},
	overlay: {
		type: Boolean,
	},
	forceHover: {
		type: Boolean,
	},
	disabled: {
		type: Boolean,
	},
});

const { realm, source, disabled } = toRefs(props);
const { user } = useCommonStore();

const isProcessing = ref(false);

const isDisabled = computed(() => disabled.value || isProcessing.value);

async function onClick() {
	if (!user.value || isDisabled.value) {
		return;
	}

	isProcessing.value = true;
	await toggleRealmFollow(realm.value, source.value);
	isProcessing.value = false;
}
</script>

<template>
	<AppButton
		v-app-auth-required
		primary
		:block="block"
		:overlay="overlay"
		:solid="realm.is_following"
		:disabled="isDisabled"
		:force-hover="forceHover"
		@click="onClick"
	>
		<template v-if="!realm.is_following">
			<AppTranslate>Follow</AppTranslate>
		</template>
		<template v-else>
			<AppTranslate>Following</AppTranslate>
		</template>
	</AppButton>
</template>
