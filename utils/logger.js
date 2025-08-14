import { Log } from '../model/logSchema.js';
import mongoose from 'mongoose';

export async function logEvent({ event, desc, user, id }) {
    try {
        if (!id) {
            const lastLog = await Log.findOne().sort({ id: -1 });
            id = lastLog ? lastLog.id + 1 : 1;
        }

        const newLog = await Log.create({
            event,
            desc,
            id,
            user
        });

        return newLog;
    } catch (err) {
        throw err
    }
}

export default logEvent