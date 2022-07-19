<script lang="ts">
import { computed, PropType, ref, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCard from '../../../../_common/card/AppCard.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { UserFriendship } from '../../../../_common/user/friendship/friendship.model';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });
</script>

<script lang="ts" setup>
const props = defineProps({
	request: {
		type: Object as PropType<UserFriendship>,
		required: true,
	},
});

const emit = defineEmits({
	cancel: () => true,
	accept: () => true,
	reject: () => true,
});

const { request } = toRefs(props);
const { user } = useCommonStore();

const isInview = ref(false);

/**
 * Is it a request we sent?
 */
const isPending = computed(() => request.value.target_user.id !== user.value!.id);
const them = computed(() => request.value.getThem(user.value!));
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
				<div class="shell-card-popover-card-media">
					<div class="friend-request-popover-avatar">
						<AppUserAvatarImg :user="them" />
					</div>
				</div>
				<div class="shell-card-popover-card-body">
					<div class="shell-card-popover-card-controls">
						<!--
							For a tags we need to prevent click events in order to stop navigation.
							stopping propogation doesn't cut it because all it's doing is stopping
							the event handlers on the parent elements to fire, but the default beahviour
							of the elements is only prevented with 'prevent'.
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

					<div class="card-title">
						<h5>
							<span class="-name -name-container">{{ them.display_name }}</span>
							<AppUserVerifiedTick :user="them" />
						</h5>

						<h5 class="-name">
							<small>@{{ them.username }}</small>
						</h5>
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

.-name
	text-overflow()

	&-container
		max-width: 150px
		display: inline-block
</style>
