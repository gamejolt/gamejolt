<script lang="ts" setup>
import { computed } from 'vue';

import {
	GameCollectionModel,
	GameCollectionType,
} from '~app/components/game/collection/collection.model';
import {
	libraryFollowCollection,
	libraryUnfollowCollection,
	useLibraryStore,
} from '~app/store/library';
import { vAppAuthRequired } from '~common/auth/auth-required-directive';
import AppButton from '~common/button/AppButton.vue';
import { formatNumber } from '~common/filters/number';
import { useCommonStore } from '~common/store/common-store';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	collection: GameCollectionModel;
	followerCount?: number;
	overlay?: boolean;
	circle?: boolean;
	block?: boolean;
};

const { collection, followerCount, overlay, circle, block } = defineProps<Props>();

const emit = defineEmits<{
	follow: [];
	unfollow: [];
}>();

const { user } = useCommonStore();
const libraryStore = useLibraryStore();
const { collections } = libraryStore;

const isFollowing = computed(() => {
	if (collection.type === GameCollectionType.Developer) {
		return collection.owner!.is_following;
	}

	return (
		collections.value.findIndex(
			item => item.type === collection.type && (item as any).id === collection.id
		) !== -1
	);
});

const badge = computed(() => {
	return !circle && isFollowing.value && followerCount ? formatNumber(followerCount) : '';
});

const tooltip = computed(() => {
	if (collection.type === GameCollectionType.Developer) {
		return undefined;
	}

	return isFollowing.value
		? $gettext(
				'Unfollow this playlist to remove it from your library and stop receiving notifications.'
			)
		: $gettext(
				'Follow this playlist to add it to your library and be notified when new games are added.'
			);
});

const icon = computed(() => {
	if (!circle) {
		return '';
	}

	return !isFollowing.value ? 'subscribe' : 'subscribed';
});

async function onClick() {
	if (!user.value) {
		return;
	}

	if (isFollowing.value) {
		try {
			emit('unfollow');
			await libraryUnfollowCollection(libraryStore, collection);
		} catch (e) {
			emit('unfollow');
			throw e;
		}
	} else {
		try {
			emit('follow');
			await libraryFollowCollection(libraryStore, collection);
		} catch (e) {
			emit('follow');
			throw e;
		}
	}
}
</script>

<template>
	<AppButton
		v-app-auth-required
		v-app-tooltip.bottom="tooltip"
		class="game-collection-follow-widget"
		primary
		:icon="icon as any"
		:circle="circle"
		:overlay="overlay"
		:block="block"
		:solid="isFollowing"
		:badge="badge"
		@click="onClick"
	>
		<template v-if="!circle">
			<template v-if="!isFollowing">
				<AppTranslate v-if="collection.type === 'developer'">Follow Developer</AppTranslate>
				<AppTranslate v-else>Follow Playlist</AppTranslate>
			</template>
			<template v-else>
				<AppTranslate>Following</AppTranslate>
			</template>
		</template>
	</AppButton>
</template>
