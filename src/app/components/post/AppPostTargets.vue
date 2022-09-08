<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { CommunityChannel } from '../../../_common/community/channel/channel.model';
import { Community } from '../../../_common/community/community.model';
import { Realm } from '../../../_common/realm/realm-model';
import AppScrollScroller from '../../../_common/scroll/AppScrollScroller.vue';
import { vAppScrollWhen } from '../../../_common/scroll/scroll-when.directive';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import AppFormsPillSelectorCommunities from '../forms/pill-selector/communities/AppFormsPillSelectorCommunities.vue';
import AppPostTargetCommunity from './target/AppPostTargetCommunity.vue';
import AppPostTargetRealm from './target/AppPostTargetRealm.vue';
import AppPostTargetsAddCommunity from './target/_add/AppPostTargetAddCommunity.vue';
import AppPostTargetsAddRealm from './target/_add/AppPostTargetAddRealm.vue';

const props = defineProps({
	communities: {
		type: Array as PropType<{ community: Community; channel?: CommunityChannel }[]>,
		required: true,
	},
	realms: {
		type: Array as PropType<Realm[]>,
		required: true,
	},
	incompleteCommunity: {
		type: Object as PropType<Community>,
		default: undefined,
	},
	targetableCommunities: {
		type: Array as PropType<Community[]>,
		default: () => [],
	},
	targetableRealms: {
		type: Array as PropType<Realm[]>,
		default: () => [],
	},
	canAddCommunity: {
		type: Boolean,
	},
	canAddRealm: {
		type: Boolean,
	},
	isLoadingRealms: {
		type: Boolean,
	},
	isEditing: {
		type: Boolean,
	},
});

const {
	incompleteCommunity,
	targetableCommunities,
	targetableRealms,
	communities,
	realms,
	canAddCommunity,
	canAddRealm,
	isLoadingRealms,
	isEditing,
} = toRefs(props);

const emit = defineEmits({
	showCommunities: () => true,
	showRealms: () => true,
	selectCommunity: (_community: Community, _channel: CommunityChannel) => true,
	selectIncompleteCommunity: (_community: Community, _channel: CommunityChannel) => true,
	selectRealm: (_realm: Realm) => true,
	removeCommunity: (_community: Community) => true,
	removeRealm: (_realm: Realm) => true,
});

const scrollingKey = ref(0);

const canShow = computed(() => {
	const communitiesValid =
		(!!targetableCommunities?.value?.length && canAddCommunity.value) ||
		communities.value.length > 0;

	if (communitiesValid) {
		return true;
	}

	const realmsValid =
		(!!targetableRealms?.value?.length && canAddRealm.value) || realms.value.length > 0;

	return realmsValid;
});

const baseClasses = computed(() => {
	const result = ['-no-flex'];
	if (isEditing.value) {
		result.push('anim-fade-in-enlarge', 'no-animate-leave');
	}
	return result;
});

function onRemoveRealm(realm: Realm) {
	emit('removeRealm', realm);
}

function onRemoveCommunity(community: Community) {
	emit('removeCommunity', community);
}

function selectRealm(realm: Realm) {
	emit('selectRealm', realm);
	_scrollToEnd();
}

function selectCommunity(community: Community, channel: CommunityChannel) {
	emit('selectCommunity', community, channel);
	_scrollToEnd();
}

function selectIncompleteCommunity(community: Community, channel: CommunityChannel) {
	emit('selectIncompleteCommunity', community, channel);
}

async function _scrollToEnd() {
	++scrollingKey.value;
}
</script>

<template>
	<AppScrollScroller v-if="canShow" horizontal thin>
		<TransitionGroup tag="div" class="-list">
			<AppFormsPillSelectorCommunities
				v-if="incompleteCommunity"
				key="incomplete-item"
				:class="baseClasses"
				:communities="targetableCommunities"
				:initial-community="incompleteCommunity"
				@select="selectIncompleteCommunity"
			>
				<AppPostTargetCommunity
					:community="incompleteCommunity"
					@remove="onRemoveCommunity"
				>
					<div class="-incomplete-channel">
						<AppTranslate>Select channel</AppTranslate>
					</div>
				</AppPostTargetCommunity>
			</AppFormsPillSelectorCommunities>

			<AppPostTargetCommunity
				v-for="{ community, channel } of communities"
				:key="`community-${community.id}`"
				:class="baseClasses"
				:can-remove="isEditing"
				:community="community"
				:channel="channel"
				:has-links="!isEditing"
				@remove="onRemoveCommunity"
			/>

			<AppPostTargetRealm
				v-for="realm of realms"
				:key="`realm-${realm.id}`"
				:class="baseClasses"
				:can-remove="isEditing"
				:realm="realm"
				:has-links="!isEditing"
				@remove="onRemoveRealm"
			/>

			<AppPostTargetsAddCommunity
				v-if="canAddCommunity"
				key="add-community"
				:class="baseClasses"
				:communities="targetableCommunities"
				@select="selectCommunity"
				@show="emit('showCommunities')"
			/>

			<AppPostTargetsAddRealm
				v-if="canAddRealm"
				key="add-realm"
				:class="baseClasses"
				:realms="targetableRealms"
				:is-loading="isLoadingRealms"
				@select="selectRealm"
				@show="emit('showRealms')"
			/>

			<span v-if="isEditing" key="autoscroll" v-app-scroll-when="scrollingKey" />
		</TransitionGroup>
	</AppScrollScroller>
</template>

<style lang="stylus" scoped>
.-list
	display: flex
	flex-wrap: nowrap
	white-space: nowrap
	margin-bottom: 5px
	gap: 5px

.-incomplete-channel
	font-weight: bold
	color: var(--theme-link)

	&:hover
		color: var(--theme-link-hover)

.-no-flex
	flex: none
</style>
