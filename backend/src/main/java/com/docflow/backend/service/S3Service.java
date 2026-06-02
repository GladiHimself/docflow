package com.docflow.backend.service;

import java.time.Duration;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final  S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    // Generates a pre-signed URL for uploading a file
    public String generatePresignedUploadUrl(String fileName) {

        // Create unique S3 key (path inside bucket)
        // UUID prevents name collisions if two people upload same filename
        String s3Key = "uploads/" + UUID.randomUUID() + "_" + fileName;

        // Define what object will be uploaded
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName) // which bucket
                .key(s3Key) // where in bucket
                .build();

        // Generate pre-signed URL valid for 15 minutes
        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(r -> r
                .signatureDuration(Duration.ofMinutes(15))  // URL valid for 15 mins
                .putObjectRequest(putObjectRequest)
        );
        return presignedRequest.url().toString(); // return URL as string

    }

        public String extractS3KeyFromUrl(String presignedUrl) {
            String path = presignedUrl.split("\\?")[0]; // remove query params
            String[] parts = path.split(".amazonaws.com/");
            return parts[1]; //return "uploads/uuid-filename"
        }

}
