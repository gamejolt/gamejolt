import { AsyncLocalStorage } from 'node:async_hooks';

import { createApp } from '~auth/bootstrap';
import { createSsrHandler } from '~common/ssr/createSsrHandler';

export default createSsrHandler({
	createApp,
	asyncLocalStorage: new AsyncLocalStorage(),
});
