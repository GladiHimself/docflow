package com.docflow.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.docflow.backend.entity.FileRecord;
import com.docflow.backend.entity.FileStatus;
import com.docflow.backend.service.FileRecordService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class FIleRecordController {

    private final FileRecordService fileRecordService;

    // Queries

    @QueryMapping // maps to "getAllFiles" in schema
    public List<FileRecord> getAllFiles() {
        return fileRecordService.getAllFiles();
    }

    @QueryMapping // maps to "getFile" in schema
    public Optional<FileRecord> getFile(@Argument Long id) {
        return fileRecordService.getFileById(id);
    }

    @QueryMapping // maps to "getFilesByStatus" in schema
    public List<FileRecord> getFilesByStatus(@Argument FileStatus status) {
        return fileRecordService.getFilesByStatus(status);
    }

    // Mutations

    @MutationMapping // maps to "createFile" in schema
    public FileRecord createFile(@Argument String fileName, @Argument String fileType) {
        return fileRecordService.createFileRecord(fileName, fileType);
    }

    @MutationMapping // maps to "updateFileStatus" in schema
    public FileRecord updateFileStatus(@Argument Long id, @Argument FileStatus status) {
        return fileRecordService.updateStatus(id, status);
    }

    @MutationMapping // maps to "deleteFile" in schema
    public boolean deleteFile(@Argument Long id) {
        return fileRecordService.deleteFile(id);
    }

    @MutationMapping // maps to "requestUpload" in schema
    public Map<String, String> requestUpload(@Argument String fileName, @Argument String fileType) {
        return fileRecordService.requestUpload(fileName, fileType);
    }

    @MutationMapping
    public FileRecord updateFileByS3Key(
            @Argument String s3Key,
            @Argument Integer recordCount) {
        return fileRecordService.updateFileByS3Key(s3Key, recordCount);
    }

    @MutationMapping
    public String generateDownloadUrl(@Argument String s3Key) {
        return fileRecordService.generateDownloadUrl(s3Key);
    }
}
