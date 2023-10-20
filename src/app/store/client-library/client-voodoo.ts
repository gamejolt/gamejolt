import { Analytics } from '../../../_common/analytics/analytics.service';
import { getExecutable } from '../../../_common/client/client-voodoo-imports';
import { showErrorGrowl } from '../../../_common/growls/growls.service';
import { isErrnoException } from '../../../utils/utils.client';
import { showClientAntiVirusModal } from '../../components/client/anti-virus-modal/anti-virus-modal.service';

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

export function trackClientVoodooOperation(operation: ClientVoodooOperation, success: boolean) {
	Analytics.trackEvent('client-op', success ? 'success' : 'error', operation);
}

export function handleClientVoodooError(
	err: unknown,
	operation: ClientVoodooOperation,
	message?: string,
	title?: string
) {
	if (
		isErrnoException(err) &&
		err.code === 'ENOENT' &&
		err.path &&
		path.resolve(err.path) === path.resolve(getExecutable())
	) {
		if (operation) {
			trackClientVoodooOperation(operation, false);
		}

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
