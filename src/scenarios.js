const SCENARIOS = {
    cloudflare_outage: {
        id: 'cloudflare_outage',
        name: "The Great Edge Failure",
        description: "A bad config push took down the WAF layer. Traffic is bypassing security!",
        initialState: {
            money: 5000,
            trafficDistribution: { WEB: 0.5, API: 0.3, FRAUD: 0.2 },
            rps: 5
        },
        events: [
            { time: 5, type: 'TOAST', message: "⚠️ ALERT: WAF Latency Spiking..." },
            { time: 10, type: 'SERVICE_FAILURE', targetType: 'waf', duration: 30, message: "🔥 CRITICAL: WAF Layer Down! Fraud entering system!" },
            { time: 15, type: 'TRAFFIC_SPIKE', amount: 20, message: "🌊 Flood of requests incoming!" },
            { time: 40, type: 'TOAST', message: "✅ WAF Rebooting..." }
        ],
        objectives: {
            survive_seconds: 60,
            min_reputation: 20
        }
    },
    build_chatgpt: {
        id: 'build_chatgpt',
        name: "Build ChatGPT",
        description: "Scale an AI chatbot. You need GPUs for Inference and Vector DBs for RAG.",
        initialState: {
            money: 8000,
            trafficDistribution: { INFERENCE: 0.6, HISTORY: 0.2, LOGIN: 0.2 },
            rps: 3
        },
        events: [
            { time: 5, type: 'TOAST', message: "🚀 Launch Day! High Inference load incoming." },
            { time: 20, type: 'TRAFFIC_SPIKE', amount: 30, trafficType: 'INFERENCE', message: "📈 Viral Tweet! Inference spike!" },
            { time: 40, type: 'TRAFFIC_SPIKE', amount: 20, trafficType: 'HISTORY', message: "📜 Users checking chat history..." }
        ],
        objectives: {
            survive_seconds: 90,
            min_reputation: 30
        }
    },
    build_instagram: {
        id: 'build_instagram',
        name: "Build Instagram",
        description: "Photo sharing app. Heavy Storage load. Use CDNs to offload S3.",
        initialState: {
            money: 6000,
            trafficDistribution: { WEB: 0.7, API: 0.2, LOGIN: 0.1 },
            rps: 4
        },
        events: [
            { time: 5, type: 'TOAST', message: "📸 Influencer posted! Static content load rising." },
            { time: 15, type: 'TRAFFIC_SPIKE', amount: 40, trafficType: 'WEB', message: "🔥 Viral Reel! CDN needed!" },
            { time: 45, type: 'SERVICE_FAILURE', targetType: 's3', duration: 10, message: "⚠️ S3 Throttling! Hope you have a CDN..." }
        ],
        objectives: {
            survive_seconds: 90,
            min_reputation: 25
        }
    },
    build_x: {
        id: 'build_x',
        name: "Build X (Twitter)",
        description: "Real-time feed. Massive ingestion. Use Kinesis (Stream) to buffer.",
        initialState: {
            money: 7000,
            trafficDistribution: { API: 0.6, WEB: 0.2, FRAUD: 0.2 },
            rps: 5
        },
        events: [
            { time: 5, type: 'TOAST', message: "🐦 Super Bowl started! Tweet volume exploding." },
            { time: 10, type: 'TRAFFIC_SPIKE', amount: 50, trafficType: 'API', message: "🌊 Tsunami of Tweets!" },
            { time: 30, type: 'TRAFFIC_SPIKE', amount: 30, trafficType: 'FRAUD', message: "🤖 Bot attack detected!" }
        ],
        objectives: {
            survive_seconds: 60,
            min_reputation: 20
        }
    }
};

function generateRandomScenario() {
    const types = [
        { name: "Viral Launch", traffic: 'INFERENCE', spike: true },
        { name: "DDoS Attack", traffic: 'FRAUD', spike: true },
        { name: "Database Lock", target: 'db', failure: true },
        { name: "AZ Outage", target: 'compute', failure: true }
    ];

    const template = types[Math.floor(Math.random() * types.length)];
    const id = `random_${Date.now()}`;

    const events = [];
    events.push({ time: 5, type: 'TOAST', message: `⚠️ WARNING: ${template.name} detected!` });

    if (template.spike) {
        events.push({ time: 10, type: 'TRAFFIC_SPIKE', amount: 30, trafficType: template.traffic, message: `🌊 ${template.name} Incoming!` });
    }

    if (template.failure) {
        events.push({ time: 10, type: 'SERVICE_FAILURE', targetType: template.target, duration: 20, message: `🔥 CRITICAL: ${template.target.toUpperCase()} Failure!` });
    }

    return {
        id: id,
        name: `Random: ${template.name}`,
        description: `Survive the ${template.name} event.`,
        initialState: {
            money: 3000,
            rps: 2
        },
        events: events,
        objectives: {
            survive_seconds: 45,
            min_reputation: 10
        }
    };
}
