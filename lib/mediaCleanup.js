/**
 * Media Cleanup Service
 * Automatically removes temporary media files and prevents memory leaks
 * Runs periodically to keep storage clean
 */

const fs = require('fs-extra');
const path = require('path');

class MediaCleanup {
    constructor(tempDirs = ['./tmp', './cache', './temp'], maxAgeHours = 24) {
        this.tempDirs = tempDirs;
        this.maxAgeMs = maxAgeHours * 60 * 60 * 1000;
        this.cleanupInterval = null;
        this.isRunning = false;
    }
    
    /**
     * Start automatic cleanup
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('🧹 Media Cleanup Service started (runs every 30 minutes)');
        
        // Run cleanup immediately
        this.cleanup();
        
        // Run cleanup every 30 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup().catch(err => console.error('Cleanup error:', err));
        }, 30 * 60 * 1000);
    }
    
    /**
     * Stop automatic cleanup
     */
    stop() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            this.isRunning = false;
            console.log('🛑 Media Cleanup Service stopped');
        }
    }
    
    /**
     * Perform cleanup
     */
    async cleanup() {
        let totalRemoved = 0;
        let totalSize = 0;
        
        for (const dir of this.tempDirs) {
            try {
                if (!fs.existsSync(dir)) {
                    fs.ensureDirSync(dir);
                    continue;
                }
                
                const files = fs.readdirSync(dir);
                const now = Date.now();
                
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);
                    const fileAge = now - stats.mtimeMs;
                    
                    if (fileAge > this.maxAgeMs) {
                        try {
                            fs.removeSync(filePath);
                            totalRemoved++;
                            totalSize += stats.size;
                        } catch (e) {
                            console.warn(`Failed to remove: ${filePath}`);
                        }
                    }
                }
            } catch (e) {
                console.error(`Error cleaning ${dir}:`, e.message);
            }
        }
        
        if (totalRemoved > 0) {
            const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
            console.log(`🧹 Cleanup: Removed ${totalRemoved} files (${sizeMB} MB)`);
        }
    }
    
    /**
     * Get storage usage
     */
    async getStorageUsage() {
        let totalSize = 0;
        let fileCount = 0;
        
        for (const dir of this.tempDirs) {
            try {
                if (!fs.existsSync(dir)) continue;
                
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);
                    totalSize += stats.size;
                    fileCount++;
                }
            } catch (e) {
                console.error(`Error reading ${dir}:`, e.message);
            }
        }
        
        return {
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            fileCount,
            directories: this.tempDirs
        };
    }
    
    /**
     * Force cleanup all old files
     */
    async forceCleanup(maxAgeHours = 1) {
        const oldMaxAge = this.maxAgeMs;
        this.maxAgeMs = maxAgeHours * 60 * 60 * 1000;
        
        await this.cleanup();
        
        this.maxAgeMs = oldMaxAge;
    }
}

module.exports = MediaCleanup;
