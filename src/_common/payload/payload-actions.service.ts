import { StickerPackOpenModal } from '../sticker/pack/open-modal/modal.service';
import { UserStickerPack } from '../sticker/pack/user_pack.model';

export const PayloadAction = {
	UNLOCK_STICKER_PACK: 'unlock-sticker-pack',
} as const;

export const PayloadActionDataKey = {
	[PayloadAction.UNLOCK_STICKER_PACK]: 'user_sticker_pack',
};

export default function checkPayloadActions(payload: any) {
	if (!payload || !payload.actions) {
		return;
	}

	if (!Array.isArray(payload.actions)) {
		return;
	}

	const actions: any[] = payload.actions;
	for (const { type, data } of actions) {
		switch (type) {
			case PayloadAction.UNLOCK_STICKER_PACK: {
				const key = PayloadActionDataKey[PayloadAction.UNLOCK_STICKER_PACK];
				if (data[key]) {
					StickerPackOpenModal.show({
						pack: new UserStickerPack(data[key]),
					});
				}
				break;
			}
		}
	}
}
