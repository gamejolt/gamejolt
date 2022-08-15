<script lang="ts" setup>
import { PropType, ref, toRefs } from 'vue';
import { followRealm, Realm, unfollowRealm } from './realm-model';
import AppButton from '../button/AppButton.vue';
import AppTranslate from '../translate/AppTranslate.vue';
import { useCommonStore } from '../store/common-store';
import { showErrorGrowl } from '../growls/growls.service';
import { $gettext } from '../translate/translate.service';
import { vAppAuthRequired } from '../auth/auth-required-directive';
import { ModalConfirm } from '../modal/confirm/confirm-service';
import { RealmFollowSource, trackRealmFollow } from '../analytics/analytics.service';

const props = defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
	source: {
		type: String as PropType<RealmFollowSource>,
		required: true,
	},
	block: {
		type: Boolean,
	},
});

const { realm, source } = toRefs(props);
const { user } = useCommonStore();

const isProcessing = ref(false);

async function onClick() {
	if (!user.value || isProcessing.value) {
		return;
	}

	isProcessing.value = true;

	if (!realm.value.is_following) {
		try {
			await followRealm(realm.value);
			trackRealmFollow(true, { source: source.value });
		} catch (e) {
			console.error(e);
			showErrorGrowl($gettext(`Failed to follow realm.`));
			trackRealmFollow(true, { failed: true, source: source.value });
		}
	} else {
		try {
			const result = await ModalConfirm.show(
				$gettext(`Are you sure you want to unfollow this realm?`),
				$gettext(`Unfollow realm?`)
			);

			if (result) {
				await unfollowRealm(realm.value);
				trackRealmFollow(false, { source: source.value });
			}
		} catch (e) {
			showErrorGrowl($gettext(`Error while trying to unfollow realm.`));
			trackRealmFollow(false, { failed: true, source: source.value });
		}
	}

	isProcessing.value = false;
}
</script>

<template>
	<AppButton
		v-app-auth-required
		primary
		:block="block"
		:solid="realm.is_following"
		:disabled="isProcessing"
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
