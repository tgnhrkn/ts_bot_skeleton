import { Client, Message } from 'discord.js';
import { MessageHandler } from './MessageHandler';
import { token } from '../token.json';

const client = new Client();

const msgHandler = new MessageHandler('.', 'command');

msgHandler.registerHandler('hey', {
    description: 'Says hi',
    action: async (_args, msg) => {
        return `Hi ${msg.member.displayName}!`;
    }
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg: Message) => {
    await msgHandler.handle(msg);
});

client.login(token);