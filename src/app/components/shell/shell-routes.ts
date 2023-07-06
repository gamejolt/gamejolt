import { nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSidebarStore } from '../../../_common/sidebar/sidebar.store';
import { closeStickerDrawer, useStickerStore } from '../../../_common/sticker/sticker-store';
import { TogglableLeftPane } from '../../store';
import { useAppStore } from '../../store/index';
import { useQuestStore } from '../../store/quest';

export type HashEventResult = false | { sidebar: TogglableLeftPane | undefined };

interface HashEvents {
	[key: string]: {
		sidebar: TogglableLeftPane | undefined;
		handler: (trailingValue: string | undefined) => HashEventResult;
	};
}

let hasInitialized = false;

export function initShellRoutes() {
	if (hasInitialized) {
		throw new Error('Route hash helpers have already been initialized.');
	}
	hasInitialized = true;

	const router = useRouter();
	const { visibleLeftPane, toggleLeftPane, showContextPane, clearPanes } = useAppStore();
	const { activeQuest } = useQuestStore();

	const {
		showOnRouteChange: shouldShowSidebarOnRouteChange,
		hideOnRouteChange: shouldHideSidebarOnRouteChange,
		showContextOnRouteChange,
	} = useSidebarStore();

	const stickerStore = useStickerStore();

	// Initialize hash events if they haven't been already. We can't inject the
	// required stores at the root of the file and need to do so lazily.
	const hashEvents: HashEvents = {
		quest: {
			sidebar: 'quests',
			handler(trailingValue) {
				const questId = trailingValue ? parseInt(trailingValue, 10) : -1;
				if (questId > 0) {
					activeQuest.value = questId;
				} else {
					activeQuest.value = undefined;
				}

				const sidebar = 'quests';
				if (visibleLeftPane.value !== sidebar) {
					toggleLeftPane(sidebar);
				}
				return { sidebar };
			},
		},
	};

	/**
	 * Gets the event key and trailing value from a hash.
	 *
	 * {@link eventKey} is anything between the `#` and the first hyphen.
	 *
	 * {@link trailingValue} is anything after the last hyphen. If there's no
	 * hyphen splitting {@link eventKey}, this will be `undefined`.
	 */
	function _getHashEventParts(hash: string) {
		const hashParts = hash.split('-');
		const eventKey = hashParts[0].substring(1);
		const trailingValue = hashParts.length > 1 ? hashParts[hashParts.length - 1] : undefined;
		return { eventKey, trailingValue };
	}

	function _getHashEventData(hash: string) {
		const { eventKey, trailingValue } = _getHashEventParts(hash);
		if (hashEvents && eventKey in hashEvents) {
			return {
				eventKey,
				trailingValue,
				event: hashEvents[eventKey],
			};
		}
		return null;
	}

	/**
	 * Checks for actionable route hashes and handles them before replacing the
	 * route.
	 */
	function handleHashEvents(): HashEventResult {
		const hash = router.currentRoute.value.hash;
		// Do nothing if there's no hash.
		if (!hash) {
			return false;
		}

		const data = _getHashEventData(hash);
		if (!data) {
			return false;
		}

		const hashEventResult = data.event.handler(data.trailingValue);
		if (!hashEventResult) {
			return false;
		}

		router.replace({
			...router.currentRoute.value,
			hash: '',
		});
		return hashEventResult;
	}

	/**
	 * Gets the expected result of a hash event without performing any
	 * actions.
	 */
	function getHashEventResult(hash: string): HashEventResult {
		const data = _getHashEventData(hash);
		if (!data) {
			return false;
		}
		return { sidebar: data.event.sidebar };
	}

	onMounted(() => {
		handleHashEvents();

		router.afterEach(async (_to, from, _failure) => {
			// Wait for any contextPane state to be changed.
			await nextTick();

			let hashEventResult = handleHashEvents();
			if (!hashEventResult && from.hash) {
				// If our current route navigation doesn't include a hash event, we
				// need to check the previous one to know if our [router.replace()]
				// call triggered this again.
				hashEventResult = getHashEventResult(from.hash);
			}

			const hashEventSidebar = (hashEventResult && hashEventResult.sidebar) || false;

			// Show any context panes that are set to show on route change.
			if (shouldShowSidebarOnRouteChange.value) {
				// Only show the context pane if our handled hash event didn't
				// affect any sidebars.
				if (!hashEventSidebar) {
					showContextPane();
				}
				showContextOnRouteChange(false);
				return;
			}

			// Hide all panes if our hash event didn't touch sidebars and we aren't
			// showing one on route change.
			if (!hashEventSidebar && shouldHideSidebarOnRouteChange.value) {
				clearPanes();
			}

			closeStickerDrawer(stickerStore);
		});
	});
}
