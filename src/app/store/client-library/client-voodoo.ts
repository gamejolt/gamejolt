import { showClientAntiVirusModal } from '~app/components/client/anti-virus-modal/anti-virus-modal.service';
import { getExecutable } from '~common/client/client-voodoo-imports';
import { showErrorGrowl } from '~common/growls/growls.service';
import { isErrnoException } from '~utils/utils.client';

const path = require('path') as typeof import('path');

export type ClientVoodooOperation =
	| 'launch'
	| 'attach'
	| 'install-begin'
	| 'install-end'
	| 'update-begin'
	| 'update-end'
	| 'patch-abort-begin'
	| 'patch-abort-end'
	| 'uninstall-begin'
	| 'uninstall-end';

export function handleClientVoodooError(
	err: unknown,
	_operation: ClientVoodooOperation,
	message?: string,
	title?: string
) {
	if (
		isErrnoException(err) &&
		err.code === 'ENOENT' &&
		err.path &&
		path.resolve(err.path) === path.resolve(getExecutable())
	) {
		if (message) {
			showClientAntiVirusModal(message, title);
		}
		return;
	}

	if (message) {
		showErrorGrowl({
			message,
			title,
		});
	}
}
