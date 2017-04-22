import { Logger } from 'client-voodoo';

export class Client_Logger
{
	static getLogInfo()
	{
		Logger.hijack();
		return Logger.getClientLog();
	}
}
