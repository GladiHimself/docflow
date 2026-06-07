import json
import boto3
import urllib.parse
import urllib.request
import os

s3_client = boto3.client('s3')
sns_client = boto3.client('sns', region_name='ap-south-1')

def lambda_handler(event, context):
    print("Lambda triggered from SQS!")
    
    for sqs_record in event['Records']:
        s3_notification = json.loads(sqs_record['body'])
        
        # Skip non-S3 messages (old/test messages in SQS)
        if 'Records' not in s3_notification:
            print("Skipping non-S3 message")
            continue
            
        for s3_record in s3_notification['Records']:
            bucket_name = s3_record['s3']['bucket']['name']
            
            # Decode URL-encoded S3 key (e.g. spaces become %20)
            s3_key = urllib.parse.unquote_plus(
                s3_record['s3']['object']['key']
            )
            
            print(f"Processing: {s3_key}")
            
            # Download file from S3
            response = s3_client.get_object(Bucket=bucket_name, Key=s3_key)
            file_content = response['Body'].read().decode('utf-8')
            
            # Count records based on file type
            record_count = 0
            file_extension = s3_key.split('.')[-1].lower()
            
            if file_extension == 'csv':
                # Count rows minus header row
                lines = file_content.strip().split('\n')
                record_count = max(0, len(lines) - 1)
            else:
                # For non-CSV files count characters
                record_count = len(file_content)
            
            print(f"Record count: {record_count}")
            
            # Call Spring Boot GraphQL API to update file status in RDS
            update_via_api(s3_key, record_count)
            
            # Send email notification via SNS
            send_notification(s3_key, record_count)
    
    return {'statusCode': 200, 'body': 'Processed!'}


def update_via_api(s3_key, record_count):
    # API_URL → Lambda env variable → http://EC2_IP:8081/graphql
    api_url = os.environ['API_URL']
    
    mutation = """
        mutation UpdateByS3Key($s3Key: String!, $recordCount: Int!) {
            updateFileByS3Key(s3Key: $s3Key, recordCount: $recordCount) {
                id
                status
                recordCount
            }
        }
    """
    
    payload = json.dumps({
        "query": mutation,
        "variables": {
            "s3Key": s3_key,
            "recordCount": record_count
        }
    }).encode('utf-8')
    
    req = urllib.request.Request(
        api_url,
        data=payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    with urllib.request.urlopen(req, timeout=10) as response:
        result = json.loads(response.read().decode('utf-8'))
        print(f"API response: {result}")


def send_notification(s3_key, record_count):
    # SNS_TOPIC_ARN → Lambda env variable
    # Find at: AWS Console → SNS → Topics → docflow-notifications → ARN
    sns_topic_arn = os.environ['SNS_TOPIC_ARN']
    
    # Extract just the filename from full S3 path
    file_name = s3_key.split('/')[-1]
    
    sns_client.publish(
        TopicArn=sns_topic_arn,
        Subject='DocFlow - File Processed Successfully!',
        Message=f'''
File Processing Complete!

File: {file_name}
Records Processed: {record_count}
S3 Key: {s3_key}
Status: PROCESSED

Your DocFlow Pipeline
        '''
    )
    print(f"SNS notification sent for: {file_name}")