<script lang="ts">
import { computed, provide, ref } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { getAbsoluteLink } from '../../../../utils/router';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import AppRealmFollowButton from '../../../../_common/realm/AppRealmFollowButton.vue';
import AppRealmFullCard from '../../../../_common/realm/AppRealmFullCard.vue';
import { Realm } from '../../../../_common/realm/realm-model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import { ShareModal } from '../../../../_common/share/card/_modal/modal.service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { User } from '../../../../_common/user/user.model';
import { kLineHeightComputed } from '../../../../_styles/variables';
import AppFiresideAvatarAdd from '../../../components/fireside/avatar/AppFiresideAvatarAdd.vue';
import AppPageContainer from '../../../components/page-container/AppPageContainer.vue';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import AppUserKnownFollowers from '../../../components/user/known-followers/AppUserKnownFollowers.vue';
import { routeRealmsViewFiresides } from './firesides/firesides.route';
import { routeRealmsOverview } from './overview/overview.route';
import { createRealmRouteStore, RealmRouteStoreKey } from './view.store';

export default {
	...defineAppRouteOptions({
		resolver: async ({ route }) => Api.sendRequest('/web/realms/' + route.params.path),
	}),
	components: { RouterView, AppFiresideAvatarAdd, AppLoadingFade },
};
</script>

<script lang="ts" setup>
const router = useRouter();
const route = useRoute();

const routeStore = createRealmRouteStore();
provide(RealmRouteStoreKey, routeStore);

const knownFollowers = ref<User[]>([]);
const knownFollowerCount = ref(0);

const shareLink = computed(() =>
	routeStore.realm.value
		? getAbsoluteLink(router, routeStore.realm.value.routeLocation)
		: undefined
);

const isBootstrapped = ref(false);
const firesides = ref<Fireside[]>([]);

const shouldShowFiresidePreview = computed(() => route.name === routeRealmsOverview.name);

// How many firesides to show in the preview row, including the "add a fireside".
const firesidesGridColumns = 3;

const displayablePreviewFiresides = computed(() => {
	// -1 to leave room for the "add a fireside"
	const perRow = firesidesGridColumns - 1;
	return Object.freeze(firesides.value.slice(0, perRow));
});

createAppRoute({
	onResolved({ payload }) {
		isBootstrapped.value = true;
		routeStore.realm.value = new Realm(payload.realm);
		knownFollowers.value = User.populate(payload.knownFollowers);
		knownFollowerCount.value = payload.knownFollowerCount || 0;
		firesides.value = Fireside.populate(payload.activeFiresides);
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
					<AppRealmFullCard v-if="Screen.isDesktop" :realm="routeStore.realm.value" />
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
								{{ $gettext(`Share`) }}
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

					<AppShareCard
						v-if="shareLink && Screen.isDesktop"
						resource="realm"
						:url="shareLink"
					/>
				</AppScrollAffix>
			</template>
			<template v-if="shouldShowFiresidePreview" #right>
				<div
					:style="{
						display: `flex`,
						justifyContent: `space-between`,
					}"
				>
					<h4 class="section-header">
						{{ $gettext(`Firesides`) }}
					</h4>

					<AppButton
						trans
						:to="{
							name: routeRealmsViewFiresides.name,
							params: { path: routeStore.realm.value.path },
						}"
					>
						{{ $gettext(`View All`) }}
					</AppButton>
				</div>

				<AppLoadingFade :is-loading="!isBootstrapped">
					<div
						:style="{
							gridTemplateColumns: `repeat(${firesidesGridColumns}, 1fr)`,
							display: `grid`,
							gridGap: `${kLineHeightComputed}px`,
							marginBottom: `${kLineHeightComputed}px`,
						}"
					>
						<AppFiresideAvatarAdd :realms="[routeStore.realm.value]" />

						<AppFiresideAvatarAdd
							v-for="fireside in displayablePreviewFiresides"
							:key="fireside.id"
							:fireside="fireside"
							hide-realm
						/>
					</div>
				</AppLoadingFade>
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
