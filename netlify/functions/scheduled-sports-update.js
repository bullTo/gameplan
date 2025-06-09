require('dotenv').config();

// Netlify scheduled function to update sports data daily
const fetch = require('node-fetch');

// This function will be triggered by a Netlify scheduled event
exports.handler = async (event) => {
  console.log('Starting scheduled sports data update');
  
  try {
    // Get the base URL
    const baseUrl = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888';
    
    // Format today's date in DD.MM.YYYY format
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`;
    
    console.log(`Fetching sports data for date: ${formattedDate}`);
    
    // Update each sport
    const sports = ['nfl', 'nba', 'nhl'];
    const results = {};
    
    for (const sport of sports) {
      console.log(`Updating ${sport.toUpperCase()} data...`);
      
      try {
        // Call the get-sports-data function for this sport
        const response = await fetch(`${baseUrl}/.netlify/functions/get-sports-data?sports=${sport}&date=${formattedDate}`);
        
        if (!response.ok) {
          throw new Error(`Error updating ${sport} data: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        results[sport] = result;
        
        console.log(`✅ Successfully updated ${sport.toUpperCase()} data`);
      } catch (error) {
        console.error(`❌ Error updating ${sport.toUpperCase()} data:`, error);
        results[sport] = { error: error.message };
      }
      
      // Wait 2 seconds between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Sports data update completed',
        results
      })
    };
  } catch (error) {
    console.error('Error in scheduled sports update:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to update sports data',
        message: error.message
      })
    };
  }
};
