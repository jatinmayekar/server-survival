const TRAFFIC_TYPES = {
    WEB: 'WEB',     // Requires S3 (Simpler, lower reward)
    API: 'API',     // Requires RDS (Complex, higher reward)
    FRAUD: 'FRAUD', // Must be blocked by WAF
    LOGIN: 'LOGIN', // Requires Auth -> DB
    INFERENCE: 'INFERENCE', // Requires GPU
    HISTORY: 'HISTORY' // Requires Chat DB
};

const CONFIG = {
    gridSize: 30,
    tileSize: 4,
    colors: {
        bg: 0x050505, grid: 0x1a1a1a,
        alb: 0x3b82f6, compute: 0xf97316,
        db: 0xdc2626, waf: 0xa855f7,
        s3: 0x10b981, line: 0x475569,
        lineActive: 0x38bdf8,
        requestWeb: 0x4ade80, // Green
        requestApi: 0xffa500, // Orange
        requestFraud: 0xff00ff, // Pink
        requestLogin: 0x3b82f6, // Blue
        requestInference: 0xd946ef, // Fuchsia
        requestHistory: 0xeab308, // Yellow
        requestFail: 0xef4444,
        cache: 0xDC382D, // Redis red
        sqs: 0xFF9900,  // AWS orange
        auth: 0x6366f1, // Indigo
        gpu: 0x10b981, // Emerald (NVIDIA-ish)
        vector_db: 0x06b6d4 // Cyan
    },
    internetNodeStartPos: { x: -40, y: 0, z: 0 },
    services: {
        waf: { name: "WAF Firewall", cost: 40, type: 'waf', processingTime: 20, capacity: 100, upkeep: 6 },
        alb: { name: "Load Balancer", cost: 50, type: 'alb', processingTime: 50, capacity: 50, upkeep: 10 },
        auth: { name: "Auth Service", cost: 60, type: 'auth', processingTime: 100, capacity: 20, upkeep: 12 },
        compute: {
            name: "EC2 Compute", cost: 80, type: 'compute', processingTime: 600, capacity: 4, upkeep: 18,
            tiers: [
                { level: 1, capacity: 4, cost: 0 },
                { level: 2, capacity: 10, cost: 120 },
                { level: 3, capacity: 18, cost: 180 }
            ]
        },
        gpu: {
            name: "GPU Node", cost: 250, type: 'gpu', processingTime: 1200, capacity: 2, upkeep: 45,
            tiers: [
                { level: 1, capacity: 2, cost: 0 },
                { level: 2, capacity: 5, cost: 400 },
                { level: 3, capacity: 10, cost: 800 }
            ]
        },
        db: {
            name: "RDS Database", cost: 180, type: 'db', processingTime: 300, capacity: 8, upkeep: 36,
            tiers: [
                { level: 1, capacity: 8, cost: 0 },
                { level: 2, capacity: 20, cost: 250 },
                { level: 3, capacity: 35, cost: 400 }
            ]
        },
        vector_db: {
            name: "Vector DB", cost: 150, type: 'vector_db', processingTime: 400, capacity: 15, upkeep: 25,
            tiers: [
                { level: 1, capacity: 15, cost: 0 },
                { level: 2, capacity: 40, cost: 300 },
                { level: 3, capacity: 80, cost: 500 }
            ]
        },
        s3: { name: "S3 Storage", cost: 30, type: 's3', processingTime: 200, capacity: 100, upkeep: 8 },
        cache: {
            name: "ElastiCache",
            cost: 75,
            type: 'cache',
            processingTime: 50,
            capacity: 30,
            upkeep: 10,
            cacheHitRate: 0.35,
            tiers: [
                { level: 1, capacity: 30, cacheHitRate: 0.35, cost: 0 },
                { level: 2, capacity: 50, cacheHitRate: 0.50, cost: 150 },
                { level: 3, capacity: 80, cacheHitRate: 0.65, cost: 200 }
            ]
        },
        sqs: {
            name: "SQS Queue",
            cost: 40,
            type: 'sqs',
            processingTime: 100,
            capacity: 10,
            maxQueueSize: 200,
            upkeep: 3
        }
    },
    survival: {
        startBudget: 400,
        baseRPS: 0.5,
        rampUp: 0.015,
        maxRPS: 25,
        trafficDistribution: {
            [TRAFFIC_TYPES.WEB]: 0.30,
            [TRAFFIC_TYPES.API]: 0.25,
            [TRAFFIC_TYPES.FRAUD]: 0.15,
            [TRAFFIC_TYPES.LOGIN]: 0.10,
            [TRAFFIC_TYPES.INFERENCE]: 0.15,
            [TRAFFIC_TYPES.HISTORY]: 0.05
        },

        SCORE_POINTS: {
            WEB_SCORE: 5,
            API_SCORE: 8,
            LOGIN_SCORE: 10,
            INFERENCE_SCORE: 20,
            HISTORY_SCORE: 5,
            WEB_REWARD: 0.80,
            API_REWARD: 1.20,
            LOGIN_REWARD: 1.50,
            INFERENCE_REWARD: 3.00,
            HISTORY_REWARD: 0.50,
            FAIL_REPUTATION: -2,
            FRAUD_PASSED_REPUTATION: -8,
            FRAUD_BLOCKED_SCORE: 10
        },

        upkeepScaling: {
            enabled: true,
            baseMultiplier: 1.0,
            maxMultiplier: 2.0,
            scaleTime: 600
        },

        fraudSpike: {
            enabled: true,
            interval: 90,
            duration: 15,
            fraudPercent: 0.40,
            warningTime: 5
        }
    },
    sandbox: {
        defaultBudget: 2000,
        defaultRPS: 1.0,
        defaultBurstCount: 10,
        upkeepEnabled: false,
        trafficDistribution: { WEB: 30, API: 25, FRAUD: 15, LOGIN: 10, INFERENCE: 15, HISTORY: 5 }
    }
};
