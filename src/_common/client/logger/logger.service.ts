import { Logger } from 'client-voodoo';

export class ClientLogger {
	static getLogInfo() {
		return Logger.getClientLog();
	}
}
