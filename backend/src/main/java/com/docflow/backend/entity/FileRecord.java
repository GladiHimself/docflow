package com.docflow.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity                          
@Table(name = "file_records")
@Data
@NoArgsConstructor
@AllArgsConstructor  
          
public class FileRecord {

    @Id                                                    // primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)   // auto increment
    private Long id;

    @Column(nullable = false)           // this column cannot be null
    private String fileName;            // name of uploaded file

    @Column(nullable = false)
    private String fileType;            // CSV, PDF, IMAGE etc

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)        // store enum as text in DB
    private FileStatus status;          // current status of file

    @Column
    private Integer recordCount;        // how many records were processed

    @Column(length = 1000)
    private String notes;               // any notes about processing

    @Column(nullable = false)
    private LocalDateTime uploadedAt;   // when was it uploaded

    @Column
    private LocalDateTime processedAt;  // when was it processed

    @Column
    private String s3Key;         // S3 key for where the file is stored

    @PrePersist                         // runs automatically before saving
    public void prePersist() {
        this.uploadedAt = LocalDateTime.now();
        this.status = FileStatus.UPLOADED;
    }
}