/**
 * TerraformParser.js
 * A simplified HCL parser to convert Terraform code into Game Entities.
 */

const TerraformParser = {
    // Map Terraform Resource Types to Game Entity Types
    RESOURCE_MAP: {
        'aws_instance': 'compute',
        'aws_s3_bucket': 's3',
        'aws_lb': 'alb',
        'aws_alb': 'alb',
        'aws_elb': 'alb',
        'aws_db_instance': 'db',
        'aws_rds_cluster': 'db',
        'aws_wafv2_web_acl': 'waf',
        'aws_waf_web_acl': 'waf',
        'aws_cloudfront_distribution': 'cdn',
        'aws_kinesis_stream': 'stream',
        'aws_sqs_queue': 'sqs',
        'aws_security_group': 'auth', // Abstract mapping
        'aws_lambda_function': 'compute', // Map Lambda to Compute for now
        'aws_dynamodb_table': 'db'
    },

    /**
     * Parses HCL code and returns a list of resources and connections.
     * @param {string} code - The HCL code string.
     * @returns {object} { resources: [], connections: [] }
     */
    parse(code) {
        const resources = [];
        const connections = [];
        const resourceMap = {}; // Map "type.name" -> Resource Object

        // 1. Remove comments
        const cleanCode = code.replace(/#.*$/gm, '').replace(/\/\/.*$/gm, '');

        // 2. Regex to find resource blocks: resource "type" "name" { content }
        // This regex is simplified and assumes standard formatting.
        const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*{([^}]*)}/g;
        let match;

        while ((match = resourceRegex.exec(cleanCode)) !== null) {
            const terraformType = match[1];
            const terraformName = match[2];
            const content = match[3];

            const gameType = this.RESOURCE_MAP[terraformType];

            if (gameType) {
                const resource = {
                    id: `${terraformType}.${terraformName}`, // Unique Terraform ID
                    terraformType: terraformType,
                    terraformName: terraformName,
                    type: gameType,
                    attributes: this.parseAttributes(content)
                };

                resources.push(resource);
                resourceMap[resource.id] = resource;
            } else {
                console.warn(`TerraformParser: Unsupported resource type '${terraformType}' ignored.`);
            }
        }

        // 3. Parse Implicit Connections (References)
        // Scan all attributes of all resources for references to other known resources.
        resources.forEach(res => {
            for (const [key, value] of Object.entries(res.attributes)) {
                // Check if value contains a reference to another resource ID
                // Pattern: type.name.id or type.name.arn
                for (const targetId of Object.keys(resourceMap)) {
                    if (value.includes(targetId)) {
                        connections.push({
                            from: res.id,
                            to: targetId
                        });
                        console.log(`TerraformParser: Found connection ${res.id} -> ${targetId} via attribute '${key}'`);
                    }
                }
            }
        });

        return { resources, connections };
    },

    /**
     * Parses key-value pairs from the block content.
     * @param {string} content - The content inside the resource block.
     * @returns {object} Key-value map.
     */
    parseAttributes(content) {
        const attributes = {};
        const lines = content.split('\n');

        lines.forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                let value = parts.slice(1).join('=').trim(); // Handle values with = inside

                // Remove quotes from strings
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }

                attributes[key] = value;
            }
        });

        return attributes;
    }
};

// Export for usage in game.js
window.TerraformParser = TerraformParser;
