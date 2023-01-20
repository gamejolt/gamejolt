<script lang="ts">
import { computed, provide, ref } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import { getAbsoluteLink } from '../../../../utils/router';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppRealmFollowButton from '../../../../_common/realm/AppRealmFollowButton.vue';
import AppRealmFullCard from '../../../../_common/realm/AppRealmFullCard.vue';
import { Realm } from '../../../../_common/realm/realm-model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import { ShareModal } from '../../../../_common/share/card/_modal/modal.service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { User } from '../../../../_common/user/user.model';
import AppPageContainer from '../../../components/page-container/AppPageContainer.vue';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import AppUserKnownFollowers from '../../../components/user/known-followers/AppUserKnownFollowers.vue';
import { createRealmRouteStore, RealmRouteStoreKey } from './view.store';

export default {
	...defineAppRouteOptions({
		resolver: async ({ route }) => Api.sendRequest('/web/realms/' + route.params.path),
	}),
};
</script>

<script lang="ts" setup>
const router = useRouter();

const routeStore = createRealmRouteStore();
provide(RealmRouteStoreKey, routeStore);

const knownFollowers = ref<User[]>([]);
const knownFollowerCount = ref(0);

const shareLink = computed(() =>
	routeStore.realm.value
		? getAbsoluteLink(router, routeStore.realm.value.routeLocation)
		: undefined
);

createAppRoute({
	onResolved({ payload }) {
		routeStore.realm.value = new Realm(payload.realm);
		knownFollowers.value = User.populate(payload.knownFollowers);
		knownFollowerCount.value = payload.knownFollowerCount || 0;
	},
});

function onShareClick() {
	if (!shareLink.value) {
		return;
	}
	ShareModal.show({ resource: 'realm', url: shareLink.value });
}
</script>

<template>
	<AppShellPageBackdrop v-if="routeStore.realm.value">
		<AppSpacer vertical :scale="10" :scale-sm="5" :scale-xs="5" />

		<AppPageContainer xl>
			<template #left>
				<AppScrollAffix :disabled="!Screen.isLg">
					<AppRealmFullCard
						v-if="Screen.isDesktop"
						:realm="routeStore.realm.value"
						:to="routeStore.realm.value.routeLocation"
						to-linkifies-image
					/>
					<template v-else>
						<h1
							:style="{
								display: `flex`,
								flexDirection: `row`,
								alignItems: `center`,
								fontSize: `18px`,
								height: `48px`,
								margin: `0`,
								marginBottom: `8px`,
							}"
						>
							<span :style="{ flex: `auto` }">{{ routeStore.realm.value.name }}</span>
							<AppButton
								:style="{ flex: `none` }"
								icon="share-airplane"
								trans
								@click="onShareClick"
							>
								<AppTranslate>Share</AppTranslate>
							</AppButton>
						</h1>

						<AppRealmFollowButton
							:style="{ marginBottom: `8px` }"
							:realm="routeStore.realm.value"
							source="realmHeader"
							block
						/>
					</template>

					<div
						class="_followers"
						:style="{
							display: `flex`,
							alignItems: `center`,
							justifyContent: `center`,
						}"
					>
						<AppUserKnownFollowers
							:users="knownFollowers"
							:count="knownFollowerCount"
						/>
					</div>
				</AppScrollAffix>
			</template>
			<template #right>
				<AppScrollAffix :disabled="!Screen.isLg">
					<AppShareCard
						v-if="shareLink && Screen.isDesktop"
						resource="realm"
						:url="shareLink"
					/>
				</AppScrollAffix>
			</template>
			<template #default>
				<RouterView />
			</template>
		</AppPageContainer>

		<AppSpacer vertical :scale="10" :scale-sm="5" :scale-xs="5" />
	</AppShellPageBackdrop>
</template>

<style lang="stylus" scoped>
._followers
	@media $media-lg-up
		display: block !important
</style>
