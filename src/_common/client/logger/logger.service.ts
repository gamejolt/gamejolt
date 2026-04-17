import { Logger } from '~common/client/client-voodoo-imports';

export class ClientLogger {
	static getLogInfo() {
		return Logger.getClientLog();
	}
}
