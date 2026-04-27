package com.docflow.backend.service;

import java.util.List;
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

    public List<FileRecord> getAllFiles() {
        return fileRecordRepository.findAll();
    }

    public Optional<FileRecord> getFileById(Long id) {
        return fileRecordRepository.findById(id);
    }

    public List<FileRecord> getFilesByStatus(FileStatus status) {
        return fileRecordRepository.findByStatus(status);
    }

    public  FileRecord createFileRecord(String fileName, String fileType) {
        FileRecord file = new FileRecord();
        file.setFileName(fileName);
        file.setFileType(fileType);
        
        return fileRecordRepository.save(file);
    }

    public FileRecord updateStatus(Long id, FileStatus status){
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

}
