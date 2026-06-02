package com.docflow.backend.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.docflow.backend.entity.FileRecord;
import com.docflow.backend.entity.FileStatus;
import com.docflow.backend.repository.FileRecordRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileRecordService {

    private final FileRecordRepository fileRecordRepository;

    private final S3Service s3Service;

    public List<FileRecord> getAllFiles() {
        return fileRecordRepository.findAll();
    }

    public Optional<FileRecord> getFileById(Long id) {
        return fileRecordRepository.findById(id);
    }

    public List<FileRecord> getFilesByStatus(FileStatus status) {
        return fileRecordRepository.findByStatus(status);
    }

    public FileRecord createFileRecord(String fileName, String fileType) {
        FileRecord file = new FileRecord();
        file.setFileName(fileName);
        file.setFileType(fileType);

        return fileRecordRepository.save(file);
    }

    public FileRecord updateStatus(Long id, FileStatus status) {
        FileRecord file = fileRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + id));
        file.setStatus(status);
        return fileRecordRepository.save(file);
    }

    public Boolean deleteFile(Long id) {
        try {
            fileRecordRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // New mthod - create file record and generate S3 uplaod URL
    public Map<String, String> requestUpload(String fileName, String fileType) {

        // Generate pre-signed URL first
        String uploadUrl = s3Service.generatePresignedUploadUrl(fileName);

        // Extract S3 key from the URL
        String s3Key = s3Service.extractS3KeyFromUrl(uploadUrl);

        // create file record in DB with s3Key
        FileRecord file = new FileRecord();
        file.setFileName(fileName);
        file.setFileType(fileType);
        file.setS3Key(s3Key); // store where file will be in S3
        FileRecord saved = fileRecordRepository.save(file);

        // Return both fileId and uplaodUrl to React
        return Map.of(
                "fileId", saved.getId().toString(),
                "uploadUrl", uploadUrl,
                "s3Key", s3Key);
    }
}
