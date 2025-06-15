require('dotenv').config();
// Netlify function for LLM API integration (OpenAI and OpenRouter)
const { OpenAI } = require('openai');
const fetch = require('node-fetch');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// OpenRouter API key for Claude 3 Opus
const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;

exports.handler = async (event) => {
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const { messages, model = "gpt-4.1", temperature = 0.7, max_tokens = 800, use_claude = true } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid messages format' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    let completion;

    console.log("use_claude__open_router_api_key::", use_claude, OPEN_ROUTER_API_KEY)

    // Use Claude 3 Opus via OpenRouter if specified and API key is available
    if (use_claude && OPEN_ROUTER_API_KEY) {
      console.log(`Sending request to Claude 3 Opus via OpenRouter with ${messages.length} messages`);

      try {
        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPEN_ROUTER_API_KEY}`,
            'HTTP-Referer': 'https://app.gameplanai.io',
            'X-Title': 'GamePlan AI'
          },
          body: JSON.stringify({
            model: 'anthropic/claude-3-opus',
            messages: messages,
            temperature: temperature,
            max_tokens: max_tokens
          })
        });

        if (!openRouterResponse.ok) {
          const errorData = await openRouterResponse.json();
          console.error('OpenRouter API error:', errorData);
          throw new Error(`OpenRouter API error: ${openRouterResponse.status} ${openRouterResponse.statusText}`);
        }

        const openRouterData = await openRouterResponse.json();
        console.log('Successfully received response from Claude 3 Opus');

        // Format the response to match OpenAI's format
        completion = {
          choices: [
            {
              message: openRouterData.choices[0].message
            }
          ],
          usage: openRouterData.usage
        };
      } catch (error) {
        console.error('Error using Claude 3 Opus:', error);
        console.log('Falling back to OpenAI...');
        // Fall back to OpenAI if Claude fails
        completion = await openai.chat.completions.create({
          model: model,
          messages: messages,
          temperature: temperature,
          max_tokens: max_tokens
        });
      }
    } else {
      // Use OpenAI as usual
      console.log(`Sending request to OpenAI with ${messages.length} messages`);
      completion = await openai.chat.completions.create({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: completion.choices[0].message,
        usage: completion.usage
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate response from OpenAI',
        details: error.response?.data?.error || error.message
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
