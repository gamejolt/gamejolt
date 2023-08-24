<script lang="ts">
import { CSSProperties, onMounted, PropType, ref, Ref, toRefs } from 'vue';
import { RouteLocationRaw, useRouter } from 'vue-router';
import { trackHomeFeedSwitch } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { RealmModel } from '../../../../_common/realm/realm-model';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import AppScrollScroller, {
	createScroller,
} from '../../../../_common/scroll/AppScrollScroller.vue';
import { kThemeBgOffset, kThemeFg } from '../../../../_common/theme/variables';
import {
	styleBorderRadiusLg,
	styleChangeBgRgba,
	styleElevate,
	styleWhen,
} from '../../../../_styles/mixins';
import { kGridGutterWidth, kGridGutterWidthXs } from '../../../../_styles/variables';
import { kShellTopNavHeight } from '../../../styles/variables';
import { HOME_FEED_ACTIVITY, HOME_FEED_FYP, HomeFeedService } from '../home-feed.service';
import { routeHome } from '../home.route';
import AppHomeFeedSwitcherTile from './AppHomeFeedSwitcherTile.vue';

export const RealmPathHistoryStateKey = 'realm' as const;

export interface RealmTabData {
	realmPath: string;
}

export type RealmSwitcherTab = typeof HOME_FEED_ACTIVITY | typeof HOME_FEED_FYP | RealmTabData;
</script>

<script lang="ts" setup>
const props = defineProps({
	feedTab: {
		type: [String, Object] as PropType<RealmSwitcherTab>,
		required: true,
	},
	listStyles: {
		type: Object as PropType<CSSProperties>,
		default: undefined,
	},
});

const { feedTab, listStyles } = toRefs(props);

const realms = ref([]) as Ref<RealmModel[]>;

const router = useRouter();
const scrollController = createScroller();

onMounted(async () => {
	const response = await Api.sendFieldsRequest(
		`/mobile/me`,
		{
			realms: true,
		},
		{ detach: true }
	);

	realms.value = RealmModel.populate(response.realms);
});

function getLocation(data: RealmSwitcherTab): RouteLocationRaw {
	let tab = '';
	let newRealmPath: string | undefined;

	const currentRealmPath = router.options.history.state[RealmPathHistoryStateKey];

	if (data === HOME_FEED_ACTIVITY) {
		tab = HomeFeedService.activityTab || '';
	} else if (data === HOME_FEED_FYP) {
		tab = HomeFeedService.fypTab || '';
	} else if (data.realmPath) {
		tab = HomeFeedService.getDefault();
		newRealmPath = data.realmPath;
	}

	const displayTab = HomeFeedService.getDefault() === tab ? undefined : tab;
	return {
		name: routeHome.name,
		params: { tab: displayTab },
		state: newRealmPath
			? {
					[RealmPathHistoryStateKey]: newRealmPath,
			  }
			: {},
		force: newRealmPath !== currentRealmPath,
	};
}

function getPath(data: RealmSwitcherTab, prefix = true) {
	if (typeof data === 'string') {
		return data;
	}
	const base = prefix ? 'realm-' : '';
	return `${base}${data.realmPath}`;
}

function onClickTile(data: RealmSwitcherTab) {
	const isActiveTile = getPath(data) === getPath(feedTab.value);
	if (!isActiveTile) {
		scrollController.scrollTo(0, {
			edge: 'left',
			behavior: 'smooth',
		});
	}

	const index =
		typeof data === 'string'
			? undefined
			: realms.value.findIndex(i => i.path === data.realmPath);

	let realm: RealmModel | null = null;
	if (index !== undefined && index !== -1) {
		realm = realms.value.splice(index, 1)[0];
		realms.value.unshift(realm);

		if (index > 0) {
			Api.sendRequest(
				`/mobile/realm/mark-viewed/${realm.path}`,
				{},
				{ detach: true }
			).catch();
		}
	}

	trackHomeFeedSwitch({
		path: getPath(data, false),
		realmId: realm?.id,
		realmIndex: index,
		realmCount: realms.value.length,
		isActive: isActiveTile,
	});
}
</script>

<template>
	<!-- AppHomeFeedSwitcher -->
	<AppScrollAffix
		anchor="top"
		:padding="0"
		:offset-top="kShellTopNavHeight.value"
		:style="{
			position: `relative`,
			marginBottom: `8px`,
		}"
	>
		<template #default="{ affixed }">
			<div
				:style="{
					paddingBottom: `2px`,
					userSelect: `none`,
					...styleWhen(affixed, {
						...styleElevate(1),
						backgroundColor: kThemeBgOffset,
					}),
					...listStyles,
				}"
			>
				<AppScrollScroller
					:controller="scrollController"
					:style="{
						display: `grid`,
					}"
					horizontal
					thin
				>
					<div
						:style="{
							display: `inline-flex`,
							flexFlow: `row nowrap`,
							alignItems: `flex-start`,
							justifyContent: `center`,
							gap: Screen.isXs ? `8px` : `12px`,
							color: kThemeFg,
							paddingTop: `8px`,
							paddingBottom: `2px`,
							...styleWhen(Screen.isXs, {
								paddingLeft: kGridGutterWidthXs.value / 2 + 'px',
								paddingRight: kGridGutterWidthXs.value / 2 + 'px',
							}),
							...styleWhen(!Screen.isXs, {
								paddingLeft: kGridGutterWidth.value / 2 + 'px',
								paddingRight: kGridGutterWidth.value / 2 + 'px',
							}),
						}"
					>
						<AppHomeFeedSwitcherTile
							:key="`static-${HOME_FEED_ACTIVITY}`"
							:to="getLocation(HOME_FEED_ACTIVITY)"
							:collapse="affixed"
							icon="users"
							title="Following"
							:is-active="feedTab === HOME_FEED_ACTIVITY"
							@click.capture="onClickTile(HOME_FEED_ACTIVITY)"
						/>

						<AppHomeFeedSwitcherTile
							:key="`static-${HOME_FEED_FYP}`"
							:to="getLocation(HOME_FEED_FYP)"
							:collapse="affixed"
							icon="star"
							title="For you"
							:is-active="feedTab === HOME_FEED_FYP"
							@click.capture="onClickTile(HOME_FEED_FYP)"
						/>

						<div
							v-if="realms.length"
							key="realm-divider"
							:style="{
								...styleBorderRadiusLg,
								...styleChangeBgRgba(`var(--theme-fg-rgb)`, 0.5),
								width: `4px`,
								position: `relative`,
								height: `50%`,
								top: `12.5%`,
								alignSelf: `flex-start`,
							}"
						>
							<div />
						</div>

						<AppHomeFeedSwitcherTile
							v-for="realm of realms"
							:key="realm.id"
							:to="getLocation({ realmPath: realm.path })"
							:collapse="affixed"
							:media-item="realm.cover"
							:title="realm.name"
							:is-active="
								typeof feedTab !== 'string' && feedTab.realmPath === realm.path
							"
							has-tooltip
							@click.capture="onClickTile({ realmPath: realm.path })"
						/>
					</div>
				</AppScrollScroller>
			</div>
		</template>
	</AppScrollAffix>
</template>
