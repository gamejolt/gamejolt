<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { CommunityChannelModel } from '../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../_common/community/community.model';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { RealmModel } from '../../../_common/realm/realm-model';
import AppScrollScroller from '../../../_common/scroll/AppScrollScroller.vue';
import { vAppScrollWhen } from '../../../_common/scroll/scroll-when.directive';
import { arrayIndexBy } from '../../../utils/array';
import AppFormsPillSelectorCommunities from '../forms/pill-selector/communities/AppFormsPillSelectorCommunities.vue';
import AppContentTargetAddCommunity from './target/_add/AppContentTargetAddCommunity.vue';
import AppContentTarget from './target/AppContentTarget.vue';
import AppContentTargetCommunity from './target/AppContentTargetCommunity.vue';
import AppContentTargetRealm from './target/AppContentTargetRealm.vue';
import { showContentTargetManageRealmsModal } from './target/manage-realms/modal.service';

const props = defineProps({
	/**
	 * The selected communities. These are not mutated by this component
	 * directly. Instead, it emits events to add and remove items from it, and
	 * its up to the parent to apply these back to the prop.
	 */
	communities: {
		type: Array as PropType<
			{ community: CommunityModel; channel?: CommunityChannelModel; featured_on?: number }[]
		>,
		required: true,
	},
	/**
	 * Similar to communities, these are not mutated by this component directly.
	 */
	realms: {
		type: Array as PropType<RealmModel[]>,
		required: true,
	},
	incompleteCommunity: {
		type: Object as PropType<CommunityModel>,
		default: undefined,
	},
	targetableCommunities: {
		type: Array as PropType<CommunityModel[]>,
		default: () => [],
	},
	noCommunityChannels: {
		type: Boolean,
		default: false,
	},
	maxCommunities: {
		type: Number,
		default: 0,
	},
	maxRealms: {
		type: Number,
		default: 0,
	},
	canAddCommunity: {
		type: Boolean,
	},
	canAddRealm: {
		type: Boolean,
	},
	canRemoveCommunities: {
		type: Boolean,
	},
	canRemoveRealms: {
		type: Boolean,
	},
	hasLinks: {
		type: Boolean,
	},
	/**
	 * Makes the targetables background color use --theme-bg instead of
	 * --theme-bg-offset.
	 *
	 * @deprecated This prop is a single-use quick hack for fireside settings sidebar,
	 * it isnt tested anywhere else. if you want this capability in other
	 * components it's time to rewrite this into a proper solution where we pass
	 * in a bg-color prop instead, and propogate it through all the nested
	 * components all the way through AppPill and AppPillBi.
	 */
	bgColorOffset: {
		type: Boolean,
	},
});

const {
	incompleteCommunity,
	targetableCommunities,
	noCommunityChannels,
	maxCommunities,
	maxRealms,
	communities,
	realms,
	canAddCommunity,
	canAddRealm,
	canRemoveCommunities,
	canRemoveRealms,
	hasLinks,
	bgColorOffset,
} = toRefs(props);

const emit = defineEmits({
	showCommunities: () => true,
	selectCommunity: (_community: CommunityModel, _channel?: CommunityChannelModel) => true,
	selectIncompleteCommunity: (_community: CommunityModel, _channel?: CommunityChannelModel) =>
		true,
	selectRealm: (_realm: RealmModel) => true,
	removeCommunity: (_community: CommunityModel) => true,
	removeRealm: (_realm: RealmModel) => true,
});

const scrollingKey = ref(0);

const canShow = computed(() => {
	// If has a community or a realm selected already.
	if (communities.value.length > 0 || realms.value.length > 0) {
		return true;
	}

	// If can select a community (requires targetableCommunities)
	if (canAddCommunity.value && !!targetableCommunities?.value?.length) {
		return true;
	}

	if (canAddRealm.value) {
		return true;
	}

	return false;
});

const showAddCommunity = computed(() => {
	if (!canAddCommunity.value) {
		return false;
	}

	if (!targetableCommunities.value.length) {
		return false;
	}

	const maxNum = maxCommunities.value;
	if (communities.value.length >= maxNum) {
		return false;
	}

	return true;
});

const showAddRealm = computed(() => {
	if (!canAddRealm.value) {
		return false;
	}

	const maxNum = maxRealms.value;
	if (realms.value.length >= maxNum) {
		return false;
	}

	return true;
});

const baseClasses = computed(() => {
	const result = ['-no-flex'];

	if (canRemoveCommunities.value) {
		result.push('anim-fade-in-enlarge', 'no-animate-leave');
	}

	return result;
});

const isEditing = computed(
	() =>
		canAddCommunity.value ||
		canAddRealm.value ||
		canRemoveCommunities.value ||
		canRemoveRealms.value
);

function onRemoveRealm(realm: RealmModel) {
	emit('removeRealm', realm);
}

function onRemoveCommunity(community: CommunityModel) {
	emit('removeCommunity', community);
}

function selectCommunity(community: CommunityModel, channel?: CommunityChannelModel) {
	emit('selectCommunity', community, channel);
	_scrollToEnd();
}

function selectIncompleteCommunity(community: CommunityModel, channel?: CommunityChannelModel) {
	emit('selectIncompleteCommunity', community, channel);
}

function selectRealm(realm: RealmModel) {
	emit('selectRealm', realm);
}

async function _scrollToEnd() {
	++scrollingKey.value;
}

async function onClickAddRealm() {
	const curRealms = realms.value;
	const newRealms = [...curRealms];

	await showContentTargetManageRealmsModal({
		selectedRealms: newRealms,
		maxRealms: maxRealms?.value || 0,
	});

	const curRealmsMap = arrayIndexBy(curRealms, 'id');
	const newRealmsMap = arrayIndexBy(newRealms, 'id');

	// emit removeRealm for removed realms.
	for (const curRealmId in curRealmsMap) {
		if (!(curRealmId in newRealmsMap)) {
			onRemoveRealm(curRealmsMap[curRealmId]);
		}
	}

	// and selectRealm for new realms.
	for (const newRealmId in newRealmsMap) {
		if (!(newRealmId in curRealmsMap)) {
			selectRealm(newRealmsMap[newRealmId]);
		}
	}

	_scrollToEnd();
}
</script>

<template>
	<AppScrollScroller v-if="canShow" horizontal thin>
		<TransitionGroup tag="div" :class="['-list', { '-bg-color-offset': bgColorOffset }]">
			<AppFormsPillSelectorCommunities
				v-if="incompleteCommunity"
				key="incomplete-item"
				:class="baseClasses"
				:communities="targetableCommunities"
				:initial-community="incompleteCommunity"
				@select="selectIncompleteCommunity"
			>
				<AppContentTargetCommunity
					:community="incompleteCommunity"
					@remove="onRemoveCommunity"
				>
					<div class="-incomplete-channel">
						{{ $gettext(`Select channel`) }}
					</div>
				</AppContentTargetCommunity>
			</AppFormsPillSelectorCommunities>

			<AppContentTargetRealm
				v-for="realm of realms"
				:key="`realm-${realm.id}`"
				:class="baseClasses"
				:can-remove="canRemoveRealms"
				:realm="realm"
				:has-links="hasLinks"
				@remove="onRemoveRealm"
			/>

			<AppContentTargetCommunity
				v-for="{ community, channel, featured_on } of communities"
				:key="`community-${community.id}`"
				:class="baseClasses"
				:can-remove="canRemoveCommunities"
				:is-featured="!!featured_on"
				:community="community"
				:channel="channel"
				:no-right="!channel"
				:has-links="hasLinks"
				@remove="onRemoveCommunity"
			/>

			<a v-if="showAddRealm" key="add-realm" :class="baseClasses" @click="onClickAddRealm">
				<AppContentTarget class="-add">
					<template #img>
						<AppJolticon icon="add" />
					</template>

					{{ $gettext(`Add realm`) }}
				</AppContentTarget>
			</a>

			<AppContentTargetAddCommunity
				v-if="showAddCommunity"
				key="add-community"
				:class="baseClasses"
				:communities="targetableCommunities"
				:no-channel="noCommunityChannels"
				@select="selectCommunity"
				@show="emit('showCommunities')"
			/>

			<span v-if="isEditing" key="autoscroll" v-app-scroll-when="scrollingKey" />
		</TransitionGroup>
	</AppScrollScroller>
</template>

<style lang="stylus" scoped>
.-bg-color-offset ::v-deep(.pill)
	background-color: var(--theme-bg)

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
