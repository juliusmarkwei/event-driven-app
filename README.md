
# Event-Driven S3 Upload Notification System

This project implements a simple Event-Driven Architecture (EDA) using AWS serverless services. When an object is uploaded to an Amazon S3 bucket, it triggers an AWS Lambda function that sends an email notification via Amazon Simple Notification Service (SNS). The infrastructure is defined using AWS Serverless Application Model (SAM) and deployed automatically via a GitHub Actions CI/CD pipeline.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Local Setup](#local-setup)
  - [GitHub Secrets](#github-secrets)
  - [Deployment](#deployment)
- [Usage](#usage)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Architecture Overview
- **Amazon S3**: A bucket (`upload-bucket-dev-<AWS_ACCOUNT_ID>`) stores uploaded objects and triggers an event on each upload.
- **AWS Lambda**: A TypeScript-based function (`NotifyFunction`) processes the S3 event and publishes a message to SNS.
- **Amazon SNS**: A topic (`upload-notification-dev`) sends email notifications to subscribed addresses.
- **AWS SAM**: Defines and provisions all resources as Infrastructure as Code (IaC).
- **GitHub Actions**: Automates deployment to a `dev` environment on push to the `main` branch.

**Flow**:
1. A file is uploaded to the S3 bucket.
2. S3 triggers the Lambda function with an event.
3. Lambda extracts the bucket and object details, then publishes a message to SNS.
4. SNS sends an email to the subscribed address.

## Features
- Fully serverless, event-driven design.
- Automatic email notifications on S3 uploads.
- Infrastructure defined with AWS SAM.
- CI/CD pipeline using GitHub Actions.
- TypeScript support for Lambda function development.
- Single `dev` environment deployment.

## Prerequisites
- **AWS Account**: With permissions to create S3 buckets, Lambda functions, SNS topics, and IAM roles.
- **Node.js**: Version 18.x (for local TypeScript compilation).
- **npm**: For managing Lambda dependencies.
- **GitHub Repository**: To store and deploy the code.
- **AWS Credentials**: Access Key ID and Secret Access Key with sufficient permissions.
- **SAM CLI**: Optional for local testing (install via `pip install aws-sam-cli`).

## Project Structure
```
.
├── lambda/                # Lambda function directory
│   ├── index.ts          # TypeScript source for Lambda handler
│   ├── package.json      # Node.js dependencies and build script
│   ├── package-lock.json # Dependency lock file
│   ├── tsconfig.json     # TypeScript configuration
│   └── dist/             # Compiled JavaScript output (generated)
└── sam/                   # SAM template directory
    └── template.yml      # AWS SAM template defining resources
└── .github/               # GitHub Actions workflows
    └── workflows/
        └── deploy.yml    # CI/CD pipeline configuration
```

- **`lambda/`**: Contains the TypeScript-based Lambda function and its build configuration.
- **`sam/`**: Houses the SAM template for infrastructure.
- **`.github/workflows/`**: Defines the deployment pipeline.

## Setup Instructions

### Local Setup
1. **Clone the Repository**:
   ```bash
   git clone www.github.com/juliusmarkwei/event-driven-app.git
   cd event-driven-app/
   ```

2. **Install Lambda Dependencies**:
   - Navigate to the `lambda/` directory and install Node.js dependencies:
     ```bash
     cd lambda
     npm install
     ```

3. **Compile TypeScript (Optional)**:
   - Test the TypeScript compilation locally:
     ```bash
     npm run build
     ```
   - This generates `lambda/dist/index.js`, which SAM will package.

### GitHub Secrets
1. **Navigate to Repository Settings**:
   - Go to your GitHub repository > **Settings > Secrets and variables > Actions > Secrets**.

2. **Add Secrets**:
   - `AWS_ACCESS_KEY_ID`: Your AWS Access Key ID.
   - `AWS_SECRET_ACCESS_KEY`: Your AWS Secret Access Key.
   - `NOTIFICATION_EMAIL`: The email address to receive notifications (e.g., `user@example.com`).

### Deployment
- **Dev**: Push to `main` for automatic deployment.
- **Prod**: Use **Actions > Deploy SAM EDA Application > Run workflow**, select `prod`, and run.


1. **Verify Deployment**:
   - Check the workflow logs for success.
   - In the AWS Console, confirm:
     - S3 bucket: `upload-bucket-dev-<AWS_ACCOUNT_ID>`.
     - Lambda function: `eda-stack-dev-NotifyFunction-<random>`.
     - SNS topic: `upload-notification-dev`.

2. **Confirm SNS Subscription**:
   - Check the first email in `EMAIL_ADDRESSES` for an SNS subscription confirmation link.
   - Click the link to subscribe (required for email delivery).

## Usage
- **Upload a File**:
  - Use the AWS S3 Console to upload a file to the `upload-bucket-dev-<AWS_ACCOUNT_ID>` bucket.
- **Receive Notification**:
  - The subscribed email address will receive a message like:
    `New file uploaded: test.txt to bucket upload-bucket-dev-123456789012`.

## Testing
1. **Manual Testing**:
   - Log in to the AWS S3 Console.
   - Navigate to the bucket (`upload-bucket-dev-<AWS_ACCOUNT_ID>`).
   - Upload a sample file (e.g., `test.txt`).
   - Check your email for the notification.

2. **Local Testing (Optional)**:
   - Install SAM CLI: `pip install aws-sam-cli`.
   - Simulate an S3 event:
     ```bash
     sam local invoke NotifyFunction -e <event.json>
     ```
   - Example `event.json`:
     ```json
     {
       "Records": [
         {
           "s3": {
             "bucket": { "name": "upload-bucket-dev-123456789012" },
             "object": { "key": "test.txt" }
           }
         }
       ]
     }
     ```

## Troubleshooting
- **Workflow Fails**:
  - Check GitHub Actions logs for errors (e.g., missing secrets, IAM permissions).
  - Ensure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are valid and have permissions for S3, Lambda, SNS, and IAM.
- **No Email Received**:
  - Verify the SNS subscription is confirmed (check email for confirmation link).
  - Check CloudWatch Logs for the Lambda function (`/aws/lambda/eda-stack-dev-NotifyFunction-<random>`).
  - Ensure the email address in `EMAIL_ADDRESSES` is correct.
- **Lambda Not Triggered**:
  - Confirm the S3 bucket’s event notification is set to trigger the Lambda function (visible in AWS Console under bucket properties).
- **TypeScript Errors**:
  - Run `cd lambda && npm run build` locally to debug compilation issues.

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Commit changes (`git commit -m "Add new feature"`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

### **Notes**
- **Single Email Subscription**: The SAM template subscribes only the first email from `EMAIL_ADDRESSES`. For multiple subscriptions, manually subscribe additional emails via the AWS SNS Console after deployment.
- **Region**: Deployed to `us-east-1` by default. Edit `AWS_REGION` in `.github/workflows/deploy.yml` to change (e.g., `eu-central-1`).
- **IAM Permissions**: The `--capabilities CAPABILITY_IAM` flag allows SAM to create necessary IAM roles.
