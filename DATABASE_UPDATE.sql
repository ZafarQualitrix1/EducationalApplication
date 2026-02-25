-- Database Update Script for Student App
-- Run these commands to update your students table with new columns

-- Add profileImage column
ALTER TABLE students ADD COLUMN profileImage LONGTEXT DEFAULT NULL;

-- Add dailyStudyMinutes column  
ALTER TABLE students ADD COLUMN dailyStudyMinutes INT DEFAULT 0;

-- Add ranking column
ALTER TABLE students ADD COLUMN ranking INT DEFAULT 0;

-- Verify the columns were added
DESCRIBE students;

-- These columns will support:
-- profileImage: Stores base64 encoded profile pictures or image URLs
-- dailyStudyMinutes: Tracks total study minutes for ranking
-- ranking: Student's rank based on study time
