import * as AWS from 'aws-sdk';
import { S3Event } from 'aws-lambda';

const sns = new AWS.SNS();

exports.handler = async (event: S3Event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = record.s3.object.key;
  const message = `New file uploaded: ${key} to bucket ${bucket}`;

  const params = {
    TopicArn: process.env.SNS_TOPIC_ARN,
    Message: message,
  };

  try {
    await sns.publish(params).promise();
    console.log('Notification sent successfully');
    return { statusCode: 200, body: 'Success' };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
