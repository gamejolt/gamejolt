<script lang="ts" setup>
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserDogtag from '../../../../_common/user/AppUserDogtag.vue';
import { UserFriendshipState } from '../../../../_common/user/friendship/friendship.model';
import { useProfileRouteStore } from '../RouteProfile.vue';

const { user: routeUser, userFriendship, isOnline } = useProfileRouteStore()!;
</script>

<template>
	<div
		v-if="routeUser"
		:style="{
			display: `inline-flex`,
			justifyContent: `center`,
			flexWrap: `wrap-reverse`,
			rowGap: `4px`,
		}"
	>
		<!-- Dogtags -->
		<AppUserDogtag v-for="tag of routeUser.dogtags" :key="tag.text" :tag="tag" />

		<!-- Friend status -->
		<span
			v-if="userFriendship && userFriendship.state === UserFriendshipState.Friends"
			v-app-tooltip="$gettext('You are friends! Awwww!')"
			class="tag tag-highlight"
		>
			{{ $gettext(`Friend`) }}
		</span>

		<!-- Online status -->
		<template v-if="isOnline !== null">
			<span
				v-if="isOnline === false"
				v-app-tooltip="$gettext('This user is currently offline.')"
				class="tag"
			>
				{{ $gettext(`Offline`) }}
			</span>
			<span
				v-else
				v-app-tooltip="$gettext('This user is currently online.')"
				class="tag tag-highlight"
			>
				{{ $gettext(`Online`) }}
			</span>
		</template>

		<!-- Following status -->
		<span
			v-if="routeUser.follows_you"
			v-app-tooltip="$gettext('This user is following you.')"
			class="tag tag-highlight"
		>
			{{ $gettext(`Follows you`) }}
		</span>
	</div>
</template>
