const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://codebattle:codebattle123@localhost:5672';
const QUEUE_NAME = 'code_execution';

let connection = null;
let channel = null;

export async function connectRabbitMQ() {
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log('✅ RabbitMQ connected');
        console.log(`📬 Queue "${QUEUE_NAME}" ready`);

        return channel;
    } catch (error) {
        console.error('❌ RabbitMQ connection error:', error);
        throw error;
    }
}

export async function publishJob(jobData: any) {
    if (!channel) {
        throw new Error('RabbitMQ channel not initialized');
    }

    const message = JSON.stringify(jobData);
    channel.sendToQueue(QUEUE_NAME, Buffer.from(message), {
        persistent: true
    });

    console.log(`📤 Published job: ${jobData.jobId}`);
}

export async function consumeJobs(callback: (job: any) => Promise<void>) {
    if (!channel) {
        throw new Error('RabbitMQ channel not initialized');
    }

    await channel.prefetch(1);

    channel.consume(QUEUE_NAME, async (msg: any) => {
        if (msg) {
            const jobData = JSON.parse(msg.content.toString());
            console.log(`📥 Received job: ${jobData.jobId}`);

            try {
                await callback(jobData);
                channel!.ack(msg);
                console.log(`✅ Job completed: ${jobData.jobId}`);
            } catch (error) {
                console.error(`❌ Job failed: ${jobData.jobId}`, error);
                channel!.nack(msg, false, false);
            }
        }
    });

    console.log('👷 Worker started, waiting for jobs...');
}

export async function closeRabbitMQ() {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
        console.log('RabbitMQ connection closed');
    } catch (error) {
        console.error('Error closing RabbitMQ:', error);
    }
}
