package com.docflow.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.docflow.backend.entity.FileRecord;
import com.docflow.backend.entity.FileStatus;

public interface FileRecordRepository extends JpaRepository<FileRecord, Long> {

    // Custom query — Spring generates SQL automatically from method name!
    List<FileRecord> findByStatus(FileStatus status);

    // finds all files with a specific file type
    List<FileRecord> findByFileType(String fileType);

    Optional<FileRecord> findByS3Key(String s3Key);

}
