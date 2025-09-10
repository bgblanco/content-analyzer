const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter: 20 saves per minute per IP
const rateLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60,
});

// In-memory storage (for demo purposes)
// In production, use a database like MongoDB, PostgreSQL, or DynamoDB
const userSavedData = new Map();

exports.handler = async (event) => {
  // Only allow POST and GET requests
  if (!['POST', 'GET', 'DELETE'].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Rate limiting by IP
    const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
    await rateLimiter.consume(ip);

    // Get user identifier (in production, use proper authentication)
    const userId = event.headers['x-user-id'] || ip;
    
    if (event.httpMethod === 'GET') {
      // Retrieve saved data
      const { type } = event.queryStringParameters || {};
      const userData = userSavedData.get(userId) || { animations: [], posts: [], templates: [] };
      
      if (type && userData[type]) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            success: true,
            type,
            data: userData[type],
            count: userData[type].length
          }),
        };
      }
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          data: userData,
          counts: {
            animations: userData.animations.length,
            posts: userData.posts.length,
            templates: userData.templates.length
          }
        }),
      };
    }
    
    if (event.httpMethod === 'POST') {
      // Save new data
      const { type, data } = JSON.parse(event.body);
      
      if (!type || !data) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing required fields: type and data' }),
        };
      }
      
      // Validate type
      const validTypes = ['animation', 'post', 'template'];
      if (!validTypes.includes(type)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }),
        };
      }
      
      // Get or create user data
      let userData = userSavedData.get(userId) || { animations: [], posts: [], templates: [] };
      
      // Add timestamp and ID to saved data
      const savedItem = {
        ...data,
        id: data.id || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        savedAt: new Date().toISOString(),
        type
      };
      
      // Add to appropriate collection (with duplicate check)
      const collection = type + 's'; // pluralize
      const existingIndex = userData[collection].findIndex(item => 
        item.id === savedItem.id || 
        (item.url && item.url === savedItem.url) ||
        (item.name && item.name === savedItem.name)
      );
      
      if (existingIndex >= 0) {
        // Update existing item
        userData[collection][existingIndex] = savedItem;
      } else {
        // Add new item (limit to 100 items per type)
        userData[collection].unshift(savedItem);
        if (userData[collection].length > 100) {
          userData[collection] = userData[collection].slice(0, 100);
        }
      }
      
      // Save back to storage
      userSavedData.set(userId, userData);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: `${type} saved successfully`,
          item: savedItem,
          totalSaved: userData[collection].length
        }),
      };
    }
    
    if (event.httpMethod === 'DELETE') {
      // Delete saved data
      const { type, id } = JSON.parse(event.body);
      
      if (!type || !id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing required fields: type and id' }),
        };
      }
      
      let userData = userSavedData.get(userId);
      if (!userData) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'No saved data found' }),
        };
      }
      
      const collection = type + 's';
      const initialLength = userData[collection].length;
      userData[collection] = userData[collection].filter(item => item.id !== id);
      
      if (userData[collection].length === initialLength) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Item not found' }),
        };
      }
      
      userSavedData.set(userId, userData);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: `${type} deleted successfully`,
          remainingCount: userData[collection].length
        }),
      };
    }
    
  } catch (error) {
    console.error('Error in save-data:', error);
    
    // Check if rate limit exceeded
    if (error.remainingPoints !== undefined) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      };
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Optional: Clean up old data periodically
setInterval(() => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  userSavedData.forEach((userData, userId) => {
    // Remove items older than one week
    ['animations', 'posts', 'templates'].forEach(collection => {
      userData[collection] = userData[collection].filter(item => {
        const savedDate = new Date(item.savedAt);
        return savedDate > oneWeekAgo;
      });
    });
    
    // Remove user data if empty
    const totalItems = userData.animations.length + userData.posts.length + userData.templates.length;
    if (totalItems === 0) {
      userSavedData.delete(userId);
    }
  });
}, 60 * 60 * 1000); // Run every hour