import 'dotenv/config';
import { query } from '@anthropic-ai/claude-agent-sdk';

async function main(prompt) {
  try {
    console.log('🎯 Starting Locus Claude SDK application...\n');

    // 1. Configure MCP connection to Locus
    console.log('Configuring Locus MCP connection...');
    const mcpServers = {
      'locus': {
        type: 'http',
        url: 'https://mcp.paywithlocus.com/mcp',
        headers: {
          'Authorization': `Bearer ${process.env.LOCUS_API_KEY}`
        }
      }
    };

    const options = {
      mcpServers,
      allowedTools: [
        'mcp__locus__*',      // Allow all Locus tools
        'mcp__list_resources',
        'mcp__read_resource'
      ],
      apiKey: process.env.ANTHROPIC_API_KEY,
      // Auto-approve Locus tool usage
      canUseTool: async (toolName, input) => {
        if (toolName.startsWith('mcp__locus__')) {
          return {
            behavior: 'allow',
            updatedInput: input
          };
        }
        return {
          behavior: 'deny',
          message: 'Only Locus tools are allowed'
        };
      }
    };

    console.log('✓ MCP configured\n');

    // 2. Run a query that uses MCP tools

    let mcpStatus = null;
    let finalResult = null;

    for await (const message of query({
      prompt: prompt,
      options
    })) {
      if (message.type === 'system' && message.subtype === 'init') {
        // Check MCP connection status
        const mcpServersInfo = message.mcp_servers;
        mcpStatus = mcpServersInfo?.find(s => s.name === 'locus');
        if (mcpStatus?.status === 'connected') {
          console.log(`✓ Connected to Locus MCP server\n`);
        } else {
          console.warn(`⚠️  MCP connection issue\n`);
        }
      } else if (message.type === 'result' && message.subtype === 'success') {
        finalResult = message.result;
      }
    }
    console.log(finalResult);

    return finalResult;

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nPlease check:');
    console.error('  • Your .env file contains valid credentials');
    console.error('  • Your network connection is active');
    console.error('  • Your Locus and Anthropic API keys are correct\n');
    process.exit(1);
  }
}

import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all origins

app.use(express.json());

app.post('/api/action', async (req, res) => {
  const data = req.body;
  let query = data.query;
  let locusResp = await main(query.toLowerCase());
  res.json({ message: 'Done', receivedData: data, locusResp });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});


// only handles cashouts because voice > venmo because it's faster
// during presentation, say I've set you up with an account and you've already bought in 5 cents to the game
// only handle natural language asr "pay judge 3 cents" 