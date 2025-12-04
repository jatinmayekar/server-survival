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
        vector_db: 0x06b6d4, // Cyan
        cdn: 0x8b5cf6, // Violet (CloudFront)
        stream: 0xf59e0b // Amber (Kinesis)
    },
    internetNodeStartPos: { x: -40, y: 0, z: 0 },
    services: {
        waf: {
            name: "WAF Firewall", cost: 40, type: 'waf', processingTime: 20, capacity: 100, upkeep: 6,
            provider: 'AWS',
            description: "Web Application Firewall.",
            instances: [
                { id: 'waf.standard', name: 'AWS WAF', cost: 40, capacity: 100, upkeep: 6, processingTime: 20, desc: "Standard Protection" },
                { id: 'shield.std', name: 'AWS Shield', cost: 100, capacity: 300, upkeep: 15, processingTime: 10, desc: "DDoS Protection" },
                { id: 'shield.adv', name: 'Shield Advanced', cost: 300, capacity: 1000, upkeep: 50, processingTime: 5, desc: "Enterprise Security" }
            ]
        },
        alb: {
            name: "Load Balancer", cost: 50, type: 'alb', processingTime: 50, capacity: 50, upkeep: 10,
            provider: 'AWS',
            description: "Elastic Load Balancing.",
            instances: [
                { id: 'alb.app', name: 'ALB', cost: 50, capacity: 50, upkeep: 10, processingTime: 50, desc: "Application Layer 7" },
                { id: 'nlb.net', name: 'NLB', cost: 120, capacity: 200, upkeep: 25, processingTime: 10, desc: "Network Layer 4 (Fast)" },
                { id: 'glb.gateway', name: 'GWLB', cost: 250, capacity: 500, upkeep: 40, processingTime: 5, desc: "Gateway Load Balancer" }
            ]
        },
        auth: { name: "Auth Service", cost: 60, type: 'auth', processingTime: 100, capacity: 20, upkeep: 12 },
        compute: {
            name: "EC2 Compute", cost: 80, type: 'compute', processingTime: 600, capacity: 4, upkeep: 18,
            provider: 'AWS',
            description: "General purpose compute capacity.",
            instances: [
                { id: 't3.micro', name: 't3.micro', cost: 80, capacity: 4, upkeep: 5, processingTime: 600, desc: "Burstable, low cost" },
                { id: 'm5.large', name: 'm5.large', cost: 200, capacity: 15, upkeep: 25, processingTime: 400, desc: "General Purpose" },
                { id: 'c6g.xlarge', name: 'c6g.xlarge', cost: 450, capacity: 40, upkeep: 60, processingTime: 200, desc: "Compute Optimized ARM" }
            ],
            tiers: [ // Kept for backward compatibility with simple upgrade logic
                { level: 1, capacity: 4, cost: 0, name: 't3.micro' },
                { level: 2, capacity: 15, cost: 120, name: 'm5.large' },
                { level: 3, capacity: 40, cost: 250, name: 'c6g.xlarge' }
            ]
        },
        gpu: {
            name: "GPU Node", cost: 250, type: 'gpu', processingTime: 1200, capacity: 2, upkeep: 45,
            provider: 'AWS',
            description: "Accelerated computing for ML.",
            instances: [
                { id: 'g4dn.xlarge', name: 'g4dn.xlarge', cost: 250, capacity: 2, upkeep: 45, processingTime: 1200, desc: "T4 Tensor Core" },
                { id: 'p3.2xlarge', name: 'p3.2xlarge', cost: 600, capacity: 6, upkeep: 120, processingTime: 600, desc: "V100 High Performance" },
                { id: 'p4d.24xlarge', name: 'p4d.24xlarge', cost: 1500, capacity: 20, upkeep: 400, processingTime: 200, desc: "A100 Ultra Cluster" }
            ],
            tiers: [
                { level: 1, capacity: 2, cost: 0, name: 'g4dn.xlarge' },
                { level: 2, capacity: 6, cost: 350, name: 'p3.2xlarge' },
                { level: 3, capacity: 20, cost: 900, name: 'p4d.24xlarge' }
            ]
        },
        db: {
            name: "RDS Database", cost: 180, type: 'db', processingTime: 300, capacity: 8, upkeep: 36,
            provider: 'AWS',
            description: "Relational Database Service.",
            instances: [
                { id: 'db.t3.micro', name: 'db.t3.micro', cost: 180, capacity: 8, upkeep: 15, processingTime: 300, desc: "Dev/Test" },
                { id: 'db.m5.large', name: 'db.m5.large', cost: 400, capacity: 25, upkeep: 50, processingTime: 150, desc: "Production General" },
                { id: 'aurora-serverless', name: 'Aurora v2', cost: 800, capacity: 60, upkeep: 100, processingTime: 80, desc: "Auto-scaling Serverless" }
            ],
            tiers: [
                { level: 1, capacity: 8, cost: 0, name: 'db.t3.micro' },
                { level: 2, capacity: 25, cost: 220, name: 'db.m5.large' },
                { level: 3, capacity: 60, cost: 400, name: 'Aurora v2' }
            ]
        },
        vector_db: {
            name: "Vector DB", cost: 150, type: 'vector_db', processingTime: 400, capacity: 15, upkeep: 25,
            provider: 'AWS',
            description: "Vector search for RAG.",
            instances: [
                { id: 'opensearch.small', name: 'OpenSearch Small', cost: 150, capacity: 15, upkeep: 25, processingTime: 400, desc: "Basic Indexing" },
                { id: 'opensearch.large', name: 'OpenSearch Large', cost: 400, capacity: 50, upkeep: 80, processingTime: 200, desc: "High Throughput" },
                { id: 'kendra', name: 'Amazon Kendra', cost: 800, capacity: 100, upkeep: 200, processingTime: 100, desc: "Intelligent Search" }
            ],
            tiers: [
                { level: 1, capacity: 15, cost: 0, name: 'OpenSearch Small' },
                { level: 2, capacity: 50, cost: 250, name: 'OpenSearch Large' },
                { level: 3, capacity: 100, cost: 400, name: 'Amazon Kendra' }
            ]
        },
        s3: {
            name: "S3 Storage", cost: 30, type: 's3', processingTime: 200, capacity: 100, upkeep: 8,
            provider: 'AWS',
            description: "Object Storage.",
            instances: [
                { id: 's3.std', name: 'S3 Standard', cost: 30, capacity: 100, upkeep: 8, processingTime: 200, desc: "General Purpose" },
                { id: 's3.express', name: 'S3 Express', cost: 150, capacity: 500, upkeep: 30, processingTime: 50, desc: "Single Zone High Perf" },
                { id: 's3.glacier', name: 'S3 Glacier', cost: 10, capacity: 50, upkeep: 2, processingTime: 800, desc: "Archive (Slow/Cheap)" }
            ]
        },
        cdn: {
            name: "CloudFront", cost: 90, type: 'cdn', processingTime: 30, capacity: 200, upkeep: 15,
            provider: 'AWS',
            description: "Content Delivery Network.",
            instances: [
                { id: 'cf.std', name: 'CloudFront Std', cost: 90, capacity: 200, upkeep: 15, processingTime: 30, desc: "Edge Caching" },
                { id: 'cf.sec', name: 'CloudFront Sec', cost: 180, capacity: 150, upkeep: 30, processingTime: 40, desc: "Security Headers + WAF" }
            ]
        },
        stream: {
            name: "Kinesis", cost: 120, type: 'stream', processingTime: 10, capacity: 500, upkeep: 20,
            provider: 'AWS',
            description: "Real-time Data Streaming.",
            instances: [
                { id: 'kinesis.prov', name: 'Kinesis Prov', cost: 120, capacity: 500, upkeep: 20, processingTime: 10, desc: "Provisioned Shards" },
                { id: 'kinesis.fire', name: 'Firehose', cost: 80, capacity: 1000, upkeep: 10, processingTime: 100, desc: "Batch Delivery" }
            ]
        },
        cache: {
            name: "ElastiCache",
            cost: 75,
            type: 'cache',
            processingTime: 50,
            capacity: 30,
            upkeep: 10,
            cacheHitRate: 0.35,
            provider: 'AWS',
            description: "In-memory caching.",
            instances: [
                { id: 'cache.t3.micro', name: 'cache.t3.micro', cost: 75, capacity: 30, upkeep: 10, cacheHitRate: 0.35, desc: "Redis Micro" },
                { id: 'cache.m5.large', name: 'cache.m5.large', cost: 200, capacity: 60, upkeep: 40, cacheHitRate: 0.60, desc: "Redis Large" },
                { id: 'cache.r6g.xlarge', name: 'cache.r6g.xlarge', cost: 400, capacity: 120, upkeep: 90, cacheHitRate: 0.85, desc: "Memory Optimized" }
            ],
            tiers: [
                { level: 1, capacity: 30, cacheHitRate: 0.35, cost: 0, name: 'cache.t3.micro' },
                { level: 2, capacity: 60, cacheHitRate: 0.60, cost: 125, name: 'cache.m5.large' },
                { level: 3, capacity: 120, cacheHitRate: 0.85, cost: 200, name: 'cache.r6g.xlarge' }
            ]
        },
        sqs: {
            name: "SQS Queue",
            cost: 40,
            type: 'sqs',
            processingTime: 100,
            capacity: 10,
            maxQueueSize: 200,
            upkeep: 3,
            provider: 'AWS',
            description: "Message Queuing.",
            instances: [
                { id: 'sqs.std', name: 'SQS Standard', cost: 40, capacity: 10, maxQueueSize: 200, upkeep: 3, processingTime: 100, desc: "Best Effort Order" },
                { id: 'sqs.fifo', name: 'SQS FIFO', cost: 80, capacity: 5, maxQueueSize: 100, upkeep: 8, processingTime: 150, desc: "Strict Ordering" }
            ]
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
