import { nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSidebarStore } from '../../../_common/sidebar/sidebar.store';
import { closeStickerDrawer, useStickerStore } from '../../../_common/sticker/sticker-store';
import { TogglableLeftPane } from '../../store';
import { useAppStore } from '../../store/index';
import { useQuestStore } from '../../store/quest';
import { showVendingMachineModal } from '../vending-machine/modal/modal.service';

export type HashEventResult = false | { sidebar: TogglableLeftPane | undefined };

interface HandlerData {
	/**
	 * Parts of the hash route split by hyphens. Excludes the key value before
	 * the first hyphen.
	 *
	 * Used for branching logic based on a root hash event, like showing data
	 * for a specific user or other resource.
	 */
	parts: string[];
	/**
	 * The last part of parts, usually an ID of some kind. Only used if the last
	 * part is a number.
	 */
	trailingId: number | undefined;
}

interface HashEvents {
	[key: string]: {
		sidebar: TogglableLeftPane | undefined;
		handler: (data: HandlerData) => HashEventResult;
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
			handler({ trailingId: questId }) {
				if (questId && questId > 0) {
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
		backpack: {
			sidebar: 'backpack',
			handler() {
				const sidebar = 'backpack';
				if (visibleLeftPane.value !== sidebar) {
					toggleLeftPane(sidebar);
				}
				return { sidebar };
			},
		},
		shop: {
			sidebar: undefined,
			handler({ parts, trailingId }) {
				let userId: number | undefined = undefined;
				let shopId: number | undefined = undefined;

				if (parts.length && parts[0] === 'user') {
					userId = trailingId;
				} else if (trailingId) {
					shopId = trailingId;
				}
				showVendingMachineModal({
					userId,
					shopId,
				});
				return { sidebar: undefined };
			},
		},
		joltydex: {
			sidebar: 'joltydex',
			handler() {
				const sidebar = 'joltydex';
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
	 * {@link trailingId} is anything after the last hyphen. If there's no
	 * hyphen splitting {@link eventKey}, this will be `undefined`.
	 */
	function _getHashEventParts(hash: string) {
		let parts = hash.split('-');
		const eventKey = parts[0].substring(1);

		// Remove the event key from our parts.
		parts = parts.slice(1);

		let trailingId: number | undefined = undefined;
		const unsafeId = parts.length ? parseInt(parts[parts.length - 1], 10) : undefined;

		// Grab a trailing ID if it's a number.
		if (unsafeId && !isNaN(unsafeId)) {
			trailingId = unsafeId;
			// Remove the trailing ID from our parts.
			parts = parts.slice(0, parts.length - 1);
		}
		return { eventKey, hashParts: parts, trailingId };
	}

	function _getHashEventData(hash: string) {
		const { eventKey, hashParts, trailingId } = _getHashEventParts(hash);
		if (hashEvents && eventKey in hashEvents) {
			return {
				eventKey,
				hashParts,
				trailingId,
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

		const hashEventResult = data.event.handler({
			parts: data.hashParts,
			trailingId: data.trailingId,
		});
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
