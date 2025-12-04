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
