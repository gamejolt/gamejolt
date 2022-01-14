import { inject, InjectionKey, ref } from 'vue';
import { Api } from '../../_common/api/api.service';
import { Game } from '../../_common/game/game.model';
import { MediaItem } from '../../_common/media-item/media-item-model';

export const AuthStoreKey: InjectionKey<AuthStore> = Symbol('auth-store');

export type AuthStore = ReturnType<typeof createAuthStore>;

export function useAuthStore() {
	return inject(AuthStoreKey)!;
}

export function createAuthStore() {
	const shouldShowCoverImage = ref(true);
	const coverMediaItem = ref<MediaItem>();
	const coverGame = ref<Game>();

	async function bootstrap() {
		const payload = await Api.sendRequest('/web/auth/get-customized-page');

		coverMediaItem.value = payload.mediaItem && new MediaItem(payload.mediaItem);
		coverGame.value = payload.game && new Game(payload.game);
	}

	function showCoverImage() {
		shouldShowCoverImage.value = true;
	}

	function hideCoverImage() {
		shouldShowCoverImage.value = false;
	}

	return {
		shouldShowCoverImage,
		coverMediaItem,
		coverGame,
		bootstrap,
		showCoverImage,
		hideCoverImage,
	};
}

export const authStore = createAuthStore();
