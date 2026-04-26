package com.docflow.backend.entity;

public enum FileStatus {
    UPLOADED,   // file just landed
    PROCESSING, // lambda is working on it
    PROCESSED,  // done successfully
    FAILED      // something went wrong

}
