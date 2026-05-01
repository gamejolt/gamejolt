<script lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

import AppButton from '~common/button/AppButton.vue';
import AppCard from '~common/card/AppCard.vue';
import { Screen } from '~common/screen/screen-service';
import AppScrollInview, { ScrollInviewConfig } from '~common/scroll/inview/AppScrollInview.vue';
import { useCommonStore } from '~common/store/common-store';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppUserVerifiedTick from '~common/user/AppUserVerifiedTick.vue';
import { UserFriendshipModel } from '~common/user/friendship/friendship.model';
import AppUserAvatarImg from '~common/user/user-avatar/AppUserAvatarImg.vue';

const InviewConfig = new ScrollInviewConfig({ margin: () => `${Screen.height / 2}px` });
</script>

<script lang="ts" setup>
type Props = {
	request: UserFriendshipModel;
};
const { request } = defineProps<Props>();

const emit = defineEmits<{
	cancel: [];
	accept: [];
	reject: [];
}>();

const { user } = useCommonStore();

const isInview = ref(false);

/**
 * Is it a request we sent?
 */
const isPending = computed(() => request.target_user.id !== user.value!.id);
const them = computed(() => request.getThem(user.value!));
</script>

<template>
	<AppScrollInview
		class="-item"
		:config="InviewConfig"
		@inview="isInview = true"
		@outview="isInview = false"
	>
		<RouterLink v-if="isInview" :to="them.url">
			<AppCard>
				<div class="-wrapper">
					<div class="-media">
						<AppUserAvatarImg :user="them" />
					</div>

					<div class="-body">
						<div>
							<span class="-display-name -name -name-container">{{
								them.display_name
							}}</span>
							<AppUserVerifiedTick :user="them" />
						</div>

						<div class="-username -name">@{{ them.username }}</div>
					</div>

					<div class="-controls">
						<!--
						For a tags we need to prevent click events in order to stop
						navigation. stopping propogation doesn't cut it because all
						it's doing is stopping the event handlers on the parent
						elements to fire, but the default beahviour of the elements
						is only prevented with 'prevent'.
						-->
						<template v-if="isPending">
							<AppButton
								v-app-tooltip="$gettext(`Cancel`)"
								tag="span"
								trans
								circle
								icon="remove"
								@click.prevent="emit('cancel')"
							/>
						</template>
						<template v-else>
							<AppButton
								v-app-tooltip="$gettext(`Add Friend`)"
								tag="span"
								primary
								circle
								icon="friend-add-2"
								@click.prevent="emit('accept')"
							/>
							<AppButton
								v-app-tooltip="
									$gettext(`Dismiss request. Sender will not be notified.`)
								"
								tag="span"
								trans
								circle
								icon="remove"
								@click.prevent="emit('reject')"
							/>
						</template>
					</div>
				</div>
			</AppCard>
		</RouterLink>
	</AppScrollInview>
</template>

<style lang="stylus" scoped>
.-item
	display: block
	height: 85px

.-wrapper
	display: flex
	align-items: center
	gap: 16px

.-media
	width: 48px
	height: 48px
	text-align: center

.-body
	flex: auto

.-controls
	flex: none

.-display-name
	font-weight: 700

.-username
	color: var(--theme-fg-muted)

.-name
	text-overflow()
	line-height: 1.2

.-name-container
	max-width: 150px
	display: inline-block
</style>
