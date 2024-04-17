<script lang="ts">
import { computed, provide, toRef } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppRealmFollowButton from '../../../../_common/realm/AppRealmFollowButton.vue';
import AppRealmFullCard from '../../../../_common/realm/AppRealmFullCard.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import { showShareModal } from '../../../../_common/share/card/_modal/modal.service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { getAbsoluteLink } from '../../../../utils/router';
import AppPageContainer from '../../../components/page-container/AppPageContainer.vue';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import AppUserKnownFollowers from '../../../components/user/known-followers/AppUserKnownFollowers.vue';
import { RealmRouteStoreKey, createRealmRouteStore } from './view.store';

export default {
	...defineAppRouteOptions({
		reloadOn: { params: ['path'] },
		resolver: async ({ route }) => Api.sendRequest('/web/realms/' + route.params.path),
	}),
};
</script>

<script lang="ts" setup>
const router = useRouter();

const routeStore = createRealmRouteStore();
const { realm, knownFollowers, knownFollowerCount, processPayload } = routeStore;
provide(RealmRouteStoreKey, routeStore);

const shareLink = computed(() =>
	realm.value ? getAbsoluteLink(router, realm.value.routeLocation) : undefined
);

createAppRoute({
	onResolved: ({ payload }) => processPayload(payload),
});

function onShareClick() {
	if (!shareLink.value) {
		return;
	}
	showShareModal({ resource: 'realm', url: shareLink.value });
}

// Try matching the sizing of AppSpacer in the template.
const stickySideTopMargin = toRef(() => 4 * (Screen.isMobile ? 5 : 10));
</script>

<template>
	<AppShellPageBackdrop v-if="realm">
		<AppSpacer vertical :scale="10" :scale-sm="5" :scale-xs="5" />

		<AppPageContainer xl sticky-sides :sticky-side-top-margin="stickySideTopMargin">
			<template #left>
				<AppRealmFullCard
					v-if="Screen.isDesktop"
					:realm="realm"
					:to="realm.routeLocation"
					link-target="image"
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
						<span :style="{ flex: `auto` }">{{ realm.name }}</span>
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
						:realm="realm"
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
					<AppUserKnownFollowers :users="knownFollowers" :count="knownFollowerCount" />
				</div>
			</template>
			<template #right>
				<AppShareCard
					v-if="shareLink && Screen.isDesktop"
					resource="realm"
					:url="shareLink"
				/>
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
