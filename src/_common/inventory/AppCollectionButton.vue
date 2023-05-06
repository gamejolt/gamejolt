<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import { routeCollectionsView } from '../../app/views/collections/view/view.route';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '../media-item/backdrop/AppMediaItemBackdrop.vue';
import { useCommonStore } from '../store/common-store';
import { User } from '../user/user.model';
import { InventoryCollection } from './collection.model';

const props = defineProps({
	collection: {
		type: Object as PropType<InventoryCollection>,
		required: true,
	},
	user: {
		type: Object as PropType<User>,
		default: undefined,
	},
	active: {
		type: Boolean,
	},
});

const { collection, user } = toRefs(props);

const route = useRoute();
const commonStore = useCommonStore();

const routeParams = computed(() => {
	const params = { collectionId: collection.value.id } as any;

	// Only navigate away from "me", if not on the "me" route already,
	// or if a different user from the common user is passed in.
	let isMe = true;
	if (route && route.params.username !== 'me') {
		isMe = false;
	} else if (commonStore.user.value?.id !== user?.value?.id) {
		isMe = false;
	}

	if (!isMe) {
		params['username'] = user?.value ? '@' + user?.value.username : route.params.username;
	}

	return params;
});
</script>

<template>
	<RouterLink :to="{ name: routeCollectionsView.name, params: routeParams }" class="_container">
		<AppMediaItemBackdrop
			v-if="collection.header_media_item"
			:media-item="collection.header_media_item"
			class="_header anim-fade-in"
		>
			<AppImgResponsive
				class="_header-img"
				:class="{ '_header-img-active': active }"
				:src="collection.header_media_item.mediaserver_url"
				:style="{
					width: `calc(40px * (1 / ${collection.header_media_item.aspectRatio}))`,
				}"
			/>
		</AppMediaItemBackdrop>
		<div class="_content">
			<span class="_name" :class="{ '_name-cover': !!collection.header_media_item }">
				{{ collection.name }}
			</span>
		</div>
	</RouterLink>
</template>

<style lang="stylus" scoped>
$-header-height = 40px

._container
	display: block
	position: relative
	z-index: 1
	height: $-header-height
	rounded-corners()
	overflow: hidden
	change-bg('bg-subtle')

._header
	position: absolute
	width: 100%
	height: $-header-height
	display: flex
	justify-content: center
	align-items: center

._header-img
	position: absolute
	min-width: 100%
	min-height: 100%
	object-fit: cover
	max-width: unset
	filter: saturate(0.1) brightness(0.75)
	transition: filter ease 0.1s

._header-img-active
	filter: unset

._content
	position: relative
	z-index: 2
	display: flex
	align-items: center
	height: 100%
	padding-left: 8px
	padding-right: 8px

._name
	color: var(--theme-fg)
	font-family: 'Germania'
	font-size: $font-size-large
	text-shadow: 0 0 6px var(--theme-bg)
	text-overflow()

._name-cover
	color: white
	text-shadow: 0 0 6px var(--theme-black)
</style>
