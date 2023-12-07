import { Ref, ref, shallowReadonly } from 'vue';
import { arrayRemove } from '../../../utils/array';
import { CreatorExperienceModel } from '../../creator/experience/experience.model';

interface ShellNoticeItem {
	id: number;
	// NOTE: If adding new types, make sure they each have a unique [type]. That
	// should be enough to allow us to check [type] for different [data] types.
	data: CustomMessageNotice | CreatorExperienceNotice;
}

interface CustomMessageNotice {
	type: 'custom-message';
	message: string;
	autoCloseMs?: number;
}

export interface CreatorExperienceNotice {
	type: 'creator-experience';
	experience: CreatorExperienceModel;
	leveledUp: boolean;
	xpGained: number;
}

function createNoticeService() {
	let _idIncrementer = 0;
	const notices = ref([]) as Ref<ShellNoticeItem[]>;

	function remove(id: number) {
		arrayRemove(notices.value, i => i.id === id);
	}

	return shallowReadonly({
		notices,
		remove,
		addNotice(data: ShellNoticeItem['data']) {
			notices.value.push({
				id: ++_idIncrementer,
				data,
			});
		},
	});
}

let ShellNotice: ReturnType<typeof createNoticeService> | null = null;

export function getShellNotice() {
	return (ShellNotice ??= createNoticeService());
}
