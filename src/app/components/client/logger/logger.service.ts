import { Logger } from 'client-voodoo';

export class ClientLogger
{
	static getLogInfo()
	{
		Logger.hijack();
		return Logger.getClientLog();
	}
}
