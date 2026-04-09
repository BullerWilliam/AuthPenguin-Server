// In-memory store (no Redis needed for local development)
class InMemoryStore {
    constructor() {
        this.store = new Map();
        this.expirations = new Map();
    }

    async get(key) {
        // Check if key has expired
        if (this.expirations.has(key) && Date.now() > this.expirations.get(key)) {
            this.store.delete(key);
            this.expirations.delete(key);
            return null;
        }
        return this.store.get(key) || null;
    }

    async set(key, value) {
        this.store.set(key, value);
        return 'OK';
    }

    async setEx(key, seconds, value) {
        this.store.set(key, value);
        this.expirations.set(key, Date.now() + seconds * 1000);
        return 'OK';
    }

    async del(key) {
        this.expirations.delete(key);
        return this.store.delete(key) ? 1 : 0;
    }

    async keys(pattern) {
        const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
        return Array.from(this.store.keys()).filter(key => {
            // Check expiration
            if (this.expirations.has(key) && Date.now() > this.expirations.get(key)) {
                this.store.delete(key);
                this.expirations.delete(key);
                return false;
            }
            return regex.test(key);
        });
    }

    async incr(key) {
        const current = parseInt(this.store.get(key) || '0') + 1;
        this.store.set(key, current.toString());
        return current;
    }

    async expire(key, seconds) {
        if (this.store.has(key)) {
            this.expirations.set(key, Date.now() + seconds * 1000);
            return 1;
        }
        return 0;
    }
}

const redisClient = new InMemoryStore();

const connectRedis = async () => {
    console.log('In-memory store initialized (no Redis needed)');
};

module.exports = { redisClient, connectRedis };
