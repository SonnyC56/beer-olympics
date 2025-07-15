import { EventEmitter } from 'events';
export class MessageQueue extends EventEmitter {
    constructor(config) {
        super();
        Object.defineProperty(this, "queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "priorityIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map([
                ['critical', []],
                ['high', []],
                ['normal', []],
                ['low', []],
            ])
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "flushTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "processing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.config = {
            maxSize: 1000,
            maxRetries: 3,
            retryDelay: 1000,
            batchSize: 50,
            flushInterval: 100,
            persistenceKey: 'websocket-queue',
            ...config,
        };
        // Load persisted messages if any
        if (this.config.persistenceKey) {
            this.loadPersistedMessages();
        }
        // Start flush timer
        this.startFlushTimer();
    }
    // Add message to queue
    enqueue(message) {
        const id = this.generateId();
        const queuedMessage = {
            ...message,
            id,
            timestamp: Date.now(),
            attempts: 0,
        };
        // Check queue size
        if (this.queue.size >= this.config.maxSize) {
            // Remove oldest low-priority message
            const removed = this.removeOldestLowPriority();
            if (!removed) {
                throw new Error('Queue is full and no low-priority messages to remove');
            }
        }
        // Add to queue and priority index
        this.queue.set(id, queuedMessage);
        this.priorityIndex.get(queuedMessage.priority).push(queuedMessage);
        // Persist if needed
        if (queuedMessage.persistent && this.config.persistenceKey) {
            this.persistQueue();
        }
        this.emit('enqueued', queuedMessage);
        return id;
    }
    // Batch enqueue multiple messages
    enqueueBatch(messages) {
        const ids = [];
        for (const message of messages) {
            try {
                const id = this.enqueue(message);
                ids.push(id);
            }
            catch (error) {
                console.error('Failed to enqueue message:', error);
            }
        }
        return ids;
    }
    // Get next batch of messages to process
    getNextBatch() {
        const batch = [];
        const now = Date.now();
        // Process by priority
        for (const [priority, messages] of this.priorityIndex.entries()) {
            for (let i = messages.length - 1; i >= 0 && batch.length < this.config.batchSize; i--) {
                const message = messages[i];
                // Check TTL
                if (message.ttl && now - message.timestamp > message.ttl) {
                    // Message expired
                    this.removeMessage(message);
                    continue;
                }
                // Check retry delay
                if (message.attempts > 0) {
                    const lastAttempt = message.timestamp + (message.attempts * this.config.retryDelay);
                    if (now < lastAttempt + this.config.retryDelay) {
                        continue; // Still in retry delay
                    }
                }
                batch.push(message);
            }
            if (batch.length >= this.config.batchSize) {
                break;
            }
        }
        return batch;
    }
    // Mark messages as sent
    markAsSent(ids) {
        for (const id of ids) {
            const message = this.queue.get(id);
            if (message) {
                this.removeMessage(message);
                this.emit('sent', message);
            }
        }
        if (this.config.persistenceKey) {
            this.persistQueue();
        }
    }
    // Mark messages as failed
    markAsFailed(ids, error) {
        const toRetry = [];
        const failed = [];
        for (const id of ids) {
            const message = this.queue.get(id);
            if (message) {
                message.attempts++;
                if (message.attempts < this.config.maxRetries) {
                    toRetry.push(message);
                }
                else {
                    failed.push(message);
                    this.removeMessage(message);
                }
            }
        }
        // Re-enqueue messages that should be retried
        for (const message of toRetry) {
            this.emit('retry', message);
        }
        // Emit failed events
        for (const message of failed) {
            this.emit('failed', message, error);
        }
        if (this.config.persistenceKey) {
            this.persistQueue();
        }
    }
    // Process queue
    async processQueue(sendFunction) {
        if (this.processing)
            return;
        this.processing = true;
        try {
            while (this.queue.size > 0) {
                const batch = this.getNextBatch();
                if (batch.length === 0) {
                    break; // No messages ready to process
                }
                const success = await sendFunction(batch);
                if (success) {
                    this.markAsSent(batch.map(m => m.id));
                }
                else {
                    this.markAsFailed(batch.map(m => m.id));
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
            }
        }
        finally {
            this.processing = false;
        }
    }
    // Remove message from queue
    removeMessage(message) {
        this.queue.delete(message.id);
        const priorityMessages = this.priorityIndex.get(message.priority);
        const index = priorityMessages.findIndex(m => m.id === message.id);
        if (index !== -1) {
            priorityMessages.splice(index, 1);
        }
    }
    // Remove oldest low priority message
    removeOldestLowPriority() {
        const priorities = ['low', 'normal', 'high', 'critical'];
        for (const priority of priorities) {
            const messages = this.priorityIndex.get(priority);
            if (messages.length > 0) {
                const oldest = messages.reduce((prev, curr) => prev.timestamp < curr.timestamp ? prev : curr);
                this.removeMessage(oldest);
                return true;
            }
        }
        return false;
    }
    // Generate unique ID
    generateId() {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    // Start flush timer
    startFlushTimer() {
        this.flushTimer = setInterval(() => {
            this.emit('flush');
        }, this.config.flushInterval);
    }
    // Persist queue to localStorage
    persistQueue() {
        if (!this.config.persistenceKey)
            return;
        try {
            const persistent = Array.from(this.queue.values())
                .filter(m => m.persistent);
            localStorage.setItem(this.config.persistenceKey, JSON.stringify(persistent));
        }
        catch (error) {
            console.error('Failed to persist queue:', error);
        }
    }
    // Load persisted messages
    loadPersistedMessages() {
        if (!this.config.persistenceKey)
            return;
        try {
            const data = localStorage.getItem(this.config.persistenceKey);
            if (data) {
                const messages = JSON.parse(data);
                for (const message of messages) {
                    this.queue.set(message.id, message);
                    this.priorityIndex.get(message.priority).push(message);
                }
                console.log(`Loaded ${messages.length} persisted messages`);
            }
        }
        catch (error) {
            console.error('Failed to load persisted messages:', error);
        }
    }
    // Get queue statistics
    getStats() {
        const byPriority = {};
        let oldest = null;
        for (const [priority, messages] of this.priorityIndex.entries()) {
            byPriority[priority] = messages.length;
            for (const message of messages) {
                if (oldest === null || message.timestamp < oldest) {
                    oldest = message.timestamp;
                }
            }
        }
        return {
            total: this.queue.size,
            byPriority,
            oldest,
            processing: this.processing,
        };
    }
    // Clear queue
    clear() {
        this.queue.clear();
        for (const messages of this.priorityIndex.values()) {
            messages.length = 0;
        }
        if (this.config.persistenceKey) {
            localStorage.removeItem(this.config.persistenceKey);
        }
        this.emit('cleared');
    }
    // Cleanup
    destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.clear();
        this.removeAllListeners();
    }
}
// Message deduplication utility
export class MessageDeduplicator {
    constructor(ttl = 60000) {
        Object.defineProperty(this, "seen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "ttl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cleanupInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.ttl = ttl;
        // Cleanup old entries every minute
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000);
    }
    // Check if message is duplicate
    isDuplicate(channel, event, data) {
        const key = this.generateKey(channel, event, data);
        const existing = this.seen.get(key);
        if (existing && Date.now() - existing < this.ttl) {
            return true;
        }
        this.seen.set(key, Date.now());
        return false;
    }
    // Generate unique key for message
    generateKey(channel, event, data) {
        const dataStr = JSON.stringify(data);
        return `${channel}:${event}:${this.hash(dataStr)}`;
    }
    // Simple hash function
    hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }
    // Cleanup old entries
    cleanup() {
        const now = Date.now();
        const toDelete = [];
        for (const [key, timestamp] of this.seen.entries()) {
            if (now - timestamp > this.ttl) {
                toDelete.push(key);
            }
        }
        for (const key of toDelete) {
            this.seen.delete(key);
        }
    }
    // Destroy
    destroy() {
        clearInterval(this.cleanupInterval);
        this.seen.clear();
    }
}
