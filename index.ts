import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { S3Event } from 'aws-lambda';

const snsClient = new SNSClient({
	region: process.env.AWS_REGION! || 'eu-central-1'
});

export const handler = async (event: S3Event) => {
	try {
		// Extract S3 event detail
		const s3Record = event.Records[0].s3;
		const bucket = s3Record.bucket.name;
		const key = decodeURIComponent(s3Record.object.key.replace(/\+/g, ' '));

		// Prepare SNS message
		const message = `New file uploaded to S3:\nBucket: ${bucket}\nKey: ${key}`;
		const command = new PublishCommand({
			TopicArn: process.env.SNS_TOPIC_ARN,
			Message: message
		});

		// Publish to SNS
		await snsClient.send(command);
		console.log(`SNS message published for s3://${bucket}/${key}`);

		return {
			statusCode: 200,
			body: JSON.stringify('Notification sent successfully')
		};
	} catch (error) {
		console.error('Error:', error);
		throw error;
	}
};
