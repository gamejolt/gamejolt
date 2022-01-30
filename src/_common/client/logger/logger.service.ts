import { Logger } from '../client-voodoo-imports';

export class ClientLogger {
	static getLogInfo() {
		return Logger.getClientLog();
	}
}
